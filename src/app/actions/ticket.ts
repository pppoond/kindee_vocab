"use server"

import { createClient } from '@/lib/supabase/server'

export async function submitTicket(formData: FormData) {
  const supabase = await createClient()

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized. Please login.' }
  }

  const title = formData.get('title') as string
  const type = formData.get('type') as string
  const description = formData.get('description') as string
  const image = formData.get('image') as File | null

  if (!title || !type || !description) {
    return { error: 'Missing required fields' }
  }

  let imageUrl = null

  if (image && image.size > 0) {
    // Basic validation
    if (image.size > 5 * 1024 * 1024) { // 5MB limit
      return { error: 'Image size should be less than 5MB' }
    }
    
    const fileExt = image.name.split('.').pop()
    const fileName = `tickets/${user.id}-${Date.now()}.${fileExt}`
    
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('kindee-vocab')
      .upload(fileName, image, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (uploadError) {
      console.error('Upload Error:', uploadError)
      return { error: 'Failed to upload image' }
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('kindee-vocab')
      .getPublicUrl(fileName)
      
    imageUrl = publicUrl
  }

  const { error: insertError } = await supabase
    .from('tickets')
    .insert({
      user_id: user.id,
      title,
      type,
      description,
      image_url: imageUrl
    })

  if (insertError) {
    console.error('Insert Error:', insertError)
    return { error: 'Failed to submit ticket' }
  }

  // --- Send Telegram Notification ---
  try {
    const { data: tokenSetting } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'telegram_notify_token')
      .single()

    const { data: chatIdSetting } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'telegram_chat_id')
      .single()

    const telegramToken = tokenSetting?.value
    
    if (telegramToken) {
      let botToken = telegramToken
      let targetChatId = chatIdSetting?.value

      // Optional: Support "BOT_TOKEN|CHAT_ID" format in single token field
      if (telegramToken.includes('|')) {
        [botToken, targetChatId] = telegramToken.split('|')
      } else if (telegramToken.includes(',')) {
        [botToken, targetChatId] = telegramToken.split(',')
      }

      if (botToken && targetChatId) {
        let message = `🎫 <b>New Ticket: ${title}</b>\n\n<b>Type:</b> ${type}\n<b>User ID:</b> ${user.id}\n\n<b>Description:</b>\n${description}`
        
        if (imageUrl) {
          message += `\n\n<a href="${imageUrl}">📷 View Attached Image</a>`
        }

        fetch(`https://api.telegram.org/bot${botToken.trim()}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: targetChatId.trim(),
            text: message,
            parse_mode: 'HTML'
          })
        }).catch(err => console.error('Telegram API Error:', err))
      } else {
        console.warn('Telegram notification skipped: Missing chat_id. Add "telegram_chat_id" to system_settings.')
      }
    }
  } catch (err) {
    console.error('Error processing Telegram notification:', err)
  }

  return { success: true }
}

export async function resolveTicket(ticketId: string) {
  const supabase = await createClient()
  
  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Check if admin (though RLS handles it, it's good to be safe)
  const { error: updateError } = await supabase
    .from('tickets')
    .update({ status: 'resolved' })
    .eq('id', ticketId)

  if (updateError) {
    console.error('Resolve Error:', updateError)
    return { error: 'Failed to resolve ticket' }
  }

  return { success: true }
}

export async function deleteTicket(ticketId: string, imageUrl?: string | null) {
  const supabase = await createClient()
  
  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // If there's an image, delete it from storage first
  if (imageUrl) {
    // Extract filename from URL (e.g. https://.../kindee-vocab/tickets/filename.png)
    const urlParts = imageUrl.split('/')
    // the last part is filename, the part before is 'tickets'
    const fileName = urlParts.pop()
    if (fileName) {
      const { error: storageError } = await supabase
        .storage
        .from('kindee-vocab')
        .remove([`tickets/${fileName}`])
        
      if (storageError) {
        console.error('Failed to delete image:', storageError)
        // We still continue to delete the ticket itself
      }
    }
  }

  // Delete ticket (RLS will enforce admin check)
  const { error: deleteError } = await supabase
    .from('tickets')
    .delete()
    .eq('id', ticketId)

  if (deleteError) {
    console.error('Delete Error:', deleteError)
    return { error: 'Failed to delete ticket' }
  }

  return { success: true }
}
