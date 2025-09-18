import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Получаем данные от Jivo
    const data = await request.json();
    console.log('Данные от Jivo:', JSON.stringify(data));

    // Извлекаем информацию из запроса
    const client_id = data.client?.id;
    const chat_id = data.chat_id;
    const client_message = data.message?.text;

    // Проверяем, есть ли текст сообщения
    if (!client_message) {
      return NextResponse.json(
        { error: 'Текст сообщения отсутствует' },
        { status: 400 }
      );
    }

    // ====== ЗАМЕНИТЕ ЭТИ КЛЮЧИ НА СВОИ! ======
    const OPENAI_API_KEY = 'sk-...ваш_ключ_OpenAI...';
    const JIVO_API_KEY = 'ваш_ключ_Jivo';

    // 1. Запрос к OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Ты дружелюбный AI-ассистент в чате поддержки. Отвечай кратко и по делу. Представляйся как виртуальный помощник.'
          },
          {
            role: 'user',
            content: client_message
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      throw new Error(`Ошибка OpenAI: ${openaiResponse.status} - ${error}`);
    }

    const openaiData = await openaiResponse.json();
    const ai_reply = openaiData.choices[0].message.content;

    console.log('Ответ AI:', ai_reply);

    // 2. Отправляем ответ обратно в Jivo
    // (Это упрощенная версия - в реальности нужно использовать Jivo API)
    return NextResponse.json({
      status: 'success',
      message: ai_reply,
      client_id: client_id,
      chat_id: chat_id
    });

  } catch (error) {
    console.error('Ошибка:', error);
    return NextResponse.json(
      { 
        error: 'Внутренняя ошибка сервера',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
