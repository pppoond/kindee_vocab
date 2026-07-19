import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function testTelegram() {
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
  
  if (!telegramToken) {
    console.log('Error: No telegram_notify_token found in database.')
    return
  }

  let botToken = telegramToken
  let targetChatId = chatIdSetting?.value

  if (telegramToken.includes('|')) {
    [botToken, targetChatId] = telegramToken.split('|')
  } else if (telegramToken.includes(',')) {
    [botToken, targetChatId] = telegramToken.split(',')
  }

  if (!botToken || !targetChatId) {
    console.log('Error: Missing target chat ID. Found token:', botToken)
    return
  }

  console.log('Found Token:', botToken.substring(0, 10) + '...')
  console.log('Found Chat ID:', targetChatId)

  const message = `🚀 <b>Test Notification</b>\n\nThis is a test message from your app to verify Telegram notification setup is working correctly!`
  
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken.trim()}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: targetChatId.trim(),
        text: message,
        parse_mode: 'HTML'
      })
    })
    
    const result = await res.json()
    if (result.ok) {
      console.log('Success! Message sent to Telegram.')
    } else {
      console.error('Telegram API Error:', result)
    }
  } catch (err) {
    console.error('Fetch error:', err)
  }
}

testTelegram()
