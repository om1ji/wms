import asyncio
import logging
import os
from dotenv import load_dotenv
from aiogram import Bot, Dispatcher
from aiogram.enums import ParseMode
from aiogram.filters import CommandStart
from aiogram.types import Message, InlineKeyboardMarkup, InlineKeyboardButton
from fastapi import FastAPI, Request
import uvicorn
from handlers import callbacks, commands

load_dotenv()

logging.basicConfig(level=logging.INFO)

bot = Bot(token=os.getenv("TELEGRAM_BOT_TOKEN"))
dp = Dispatcher()

callbacks.bot = bot

dp.include_router(callbacks.router)
dp.include_router(commands.router)

class OrderData:
    order_id: str
    telegram_user_id: str
    warehouse_name: str
    date: str
    box_size: str | None = None
    box_count: str | None = None
    pallet_count: str | None = None
    pallet_weight: str | None = None
    company_name: str | None = None
    client_name: str | None = None
    client_phone: str | None = None
    cost: str = None
    delivery_price: str = None
    comments: str | None = None
    additional_services: str | None = None
    
app = FastAPI()

def message_builder(order_data: OrderData) -> str:
    text = f"""
    Заказ #{order_data.order_id}

📦 *Склад:* {order_data.warehouse_name}
📅 *Дата:* {order_data.date}
    """
    if order_data.box_size:
        text += f"📏 *Размер коробок:* {order_data.box_size}\n"
        text += f"🔢 *Количество коробок:* {order_data.box_count}\n"
        
    if order_data.pallet_count:
        text += f"🎁 *Количество паллетов:* {order_data.pallet_count}\n"
        text += f"🎁 *Вес паллеты:* {order_data.pallet_weight}\n"
        
    if order_data.additional_services:
        text += f"🔧 *Дополнительные услуги:* {order_data.additional_services}\n"
        
        
    text += f"""
    🏢 *Компания:* {order_data.company_name}
👨‍💼 *Контактное лицо:* {order_data.client_name} {order_data.client_phone}
    """
        
    text += f"💰 *Объявленная стоимость:* {order_data.cost} ₽"
    text += f"💰 *Стоимость доставки:* {order_data.delivery_price} ₽"
    
    if order_data.comments:
        text += f"📝 *Комментарии:* {order_data.comments}\n"
        
    return text


@dp.message(CommandStart())
async def command_start_handler(message: Message) -> None:
    await message.answer(f"Привет, {message.from_user.full_name}! Я бот для управления заказами.")

async def send_order_notification(order_data):
    chat_id = os.getenv("TELEGRAM_GROUP_ID")
    text = message_builder(order_data)
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="✅ Принять", callback_data=f"order_accept_{order_data.get('order_id')}_{order_data.get('telegram_user_id')}"),
            InlineKeyboardButton(text="❌ Отклонить", callback_data=f"order_reject_{order_data.get('order_id')}_{order_data.get('telegram_user_id')}")
        ]
    ])
    
    await bot.send_message(chat_id=chat_id, text=text, parse_mode=ParseMode.MARKDOWN, reply_markup=keyboard)

# Эндпоинт для приема уведомлений
@app.post("/api/send_notification")
async def send_notification(request: Request):
    try:
        order_data = await request.json()
        await send_order_notification(order_data)
        return {"status": "success"}
    except Exception as e:
        logging.error(f"Error sending notification: {str(e)}")
        return {"status": "error", "message": str(e)}

# Запуск FastAPI сервера вместе с ботом
async def main() -> None:
    # Запускаем бота
    bot_task = asyncio.create_task(dp.start_polling(bot))
    
    # Запускаем FastAPI сервер
    config = uvicorn.Config(app, host="0.0.0.0", port=8080)
    server = uvicorn.Server(config)
    await server.serve()

@app.get("/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    asyncio.run(main())