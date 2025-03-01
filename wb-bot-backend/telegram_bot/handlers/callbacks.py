from aiogram import Router
from aiogram.types import CallbackQuery
from aiogram import F
import logging
from services.api_client import ApiClient

router = Router()
logger = logging.getLogger(__name__)

# Переменная bot будет установлена из bot.py
bot = None

@router.callback_query(F.data.startswith("order_"))
async def process_order_action(callback: CallbackQuery):
    try:
        # Разбираем callback_data
        parts = callback.data.split("_")
        action = parts[1]
        order_id = parts[2]
        telegram_user_id = parts[3]
        
        logger.info(f"Processing order action: {action} for order {order_id}")
        
        if action == "accept":
            # Обновляем статус заказа на "Принят"
            result = ApiClient.update_order_status(order_id, "Принят")
            
            if "error" not in result:
                await callback.message.edit_text(f"Заказ #{order_id} принят!")
                await bot.send_message(chat_id=telegram_user_id, text=f"Заказ #{order_id} принят!")
            else:
                await callback.message.edit_text(f"Ошибка при принятии заказа #{order_id}: {result['error']}")
                
        elif action == "reject":
            # Обновляем статус заказа на "Отменен"
            result = ApiClient.update_order_status(order_id, "Отменен")
            
            if "error" not in result:
                await callback.message.edit_text(f"Заказ #{order_id} отклонен!")
                await bot.send_message(chat_id=telegram_user_id, text=f"Заказ #{order_id} отклонен!")
            else:
                await callback.message.edit_text(f"Ошибка при отклонении заказа #{order_id}: {result['error']}")
                
    except Exception as e:
        logger.error(f"Error processing order action: {str(e)}")
        await callback.message.edit_text("Произошла ошибка при обработке запроса")
    
    await callback.answer() 