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

  return { success: true }
}
