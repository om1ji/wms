// Update the handleServiceChange function to better handle address requirements
const handleServiceChange = (serviceId) => (event) => {
  const isChecked = event.target.checked;
  
  setSelectedServices(prev => ({
    ...prev,
    [serviceId]: isChecked
  }));

  // Обновляем formData
  let updatedServices;
  
  if (isChecked) {
    // Преобразуем текстовый ID в числовой из маппинга
    const numericServiceId = serviceIdMapping[serviceId] || serviceId;
    updatedServices = [...formData, numericServiceId];
  } else {
    // Удаляем и строковый ID, и числовой вариант (если такой есть)
    const numericServiceId = serviceIdMapping[serviceId];
    updatedServices = formData.filter(id => 
      id !== serviceId && id !== numericServiceId
    );
  }
  
  // Проверяем, требуется ли адрес для какой-либо из выбранных услуг
  const needsAddress = updatedServices.some(id => 
    requiresLocationServices.includes(id) || 
    (typeof id === 'string' && id.includes('pickup'))
  );
  
  // Если нужен адрес, обновляем данные с текущим адресом
  if (needsAddress) {
    updateFormData({
      additionalServices: updatedServices,
      pickupAddress: pickupAddress
    });
  } else {
    // Если адрес не нужен, просто обновляем список услуг
    updateFormData(updatedServices);
  }
}; 