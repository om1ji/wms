import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { 
  Paper, 
  Typography, 
  FormGroup, 
  FormControlLabel, 
  Checkbox,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  CircularProgress,
  TextField,
  Box
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { api } from '../api/client.tsx';

const StyledPaper = styled(Paper)`
  padding: 2rem;
  margin-bottom: 2rem;
`;

const SectionTitle = styled(Typography)`
  margin-bottom: 2rem;
  color: var(--tg-theme-text-color, #000);
`;

const ServiceDescription = styled(Typography)`
  margin-bottom: 1rem;
  color: var(--tg-theme-text-color, #000);
`;

const StyledAccordion = styled(Accordion)`
  margin-bottom: 1rem;
`;

const StyledAccordionSummary = styled(AccordionSummary)`
  background-color: #f5f5f5;
`;

const ServicePrice = styled(Typography)`
  margin-left: auto;
  font-weight: bold;
  color: var(--tg-theme-text-color, #000);
`;

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
`;

const AddressField = styled(TextField)`
  margin-top: 1rem;
  margin-bottom: 1rem;
`;

const RequiresLocationBox = styled(Box)`
  margin-top: 8px;
  padding: 8px;
  display: flex;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.04);
  border-radius: 4px;
`;

const LocationIcon = styled(LocationOnIcon)`
  margin-right: 8px;
  color: #1976d2;
`;

const LocationInput = styled(Box)`
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 4px;
  border: 1px solid ${props => props.error ? '#f44336' : 'transparent'};
`;

const LocationTitle = styled(Typography)`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const AdditionalServicesStep = ({ 
  formData, 
  pickupAddress: initialPickupAddress = '', 
  updateFormData, 
  onValidationChange, 
  shouldValidate, 
  showErrors 
}) => {
  // Дополнительные услуги необязательны, поэтому всегда валидны
  const [selectedServices, setSelectedServices] = useState({});
  const [services, setServices] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pickupAddress, setPickupAddress] = useState(initialPickupAddress);
  const [requiresLocationServices, setRequiresLocationServices] = useState([]);
  const [addressError, setAddressError] = useState(false);

  // Маппинг текстовых идентификаторов услуг на числовые ID из базы данных
  const serviceIdMapping = {
    'pickup_city_small': 1,
    'pickup_city_large': 2,
    'pickup_city_pallet_small': 3,
    'pickup_city_pallet_large': 4,
    'palletizing_small': 5,
    'palletizing_large': 6,
    'loader_20': 7,
    'loader_40': 8,
    'loader_60': 9,
    'loader_61plus': 10,
  };

  useEffect(() => {
    // Получаем информацию о дополнительных услугах и ценах с бэкенда
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        
        // Пытаемся получить данные с сервера через API
        try {
          const servicesData = await api.getAdditionalServices();
          console.log("Received services data:", servicesData);
          setServices(servicesData);
          
          // Собираем все ID сервисов, требующих адрес
          const locationServices = [];
          if (servicesData && servicesData.serviceGroups) {
            servicesData.serviceGroups.forEach(group => {
              group.services.forEach(service => {
                if (service.requires_location) {
                  locationServices.push(service.id);
                }
              });
            });
          }
          setRequiresLocationServices(locationServices);
          
          setError(null);
        } catch (apiError) {
          console.warn('API для дополнительных услуг не реализован:', apiError);
          // Если API не реализован или вернул ошибку, используем заглушку с данными
          const mockServicesData = {
            serviceGroups: [
              {
                title: 'Забор груза',
                services: [
                  { id: 'pickup_city_small', name: 'Забор груза по городу (1-10 коробок)', price: '500 ₽', requires_location: true },
                  { id: 'pickup_city_large', name: 'Забор груза по городу (11+ коробок)', price: '1000 ₽', requires_location: true },
                  { id: 'pickup_city_pallet_small', name: 'Забор груза по городу (1 паллет до 500кг)', price: '1000 ₽', requires_location: true },
                  { id: 'pickup_city_pallet_large', name: 'Забор груза по городу (1 паллет 500+ кг)', price: '1500 ₽', requires_location: true },
                  { id: 'pickup_suburban_20km', name: 'Забор груза за городом до 20км', price: '2500 ₽', requires_location: true },
                  { id: 'pickup_suburban_50km', name: 'Забор груза за городом 20-50км', price: '4000 ₽', requires_location: true },
                ]
              },
              {
                title: 'Паллетирование',
                services: [
                  { id: 'palletizing_small', name: 'Паллетирование (1 паллет до 1 куба)', price: '400 ₽', requires_location: false },
                  { id: 'palletizing_large', name: 'Паллетирование (1 паллет более 1 куба)', price: '500 ₽', requires_location: false },
                ]
              },
              {
                title: 'Услуги грузчика',
                services: [
                  { id: 'loader_20', name: 'Услуги грузчика (до 20 коробок)', price: '500 ₽', requires_location: false },
                  { id: 'loader_40', name: 'Услуги грузчика (21-40 коробок)', price: '1000 ₽', requires_location: false },
                  { id: 'loader_60', name: 'Услуги грузчика (41-60 коробок)', price: '1500 ₽', requires_location: false },
                  { id: 'loader_61plus', name: 'Услуги грузчика (61+ коробок)', price: '2000 ₽', requires_location: false },
                ]
              }
            ]
          };
          
          // Собираем все ID сервисов, требующих адрес из мок-данных
          const locationServices = [];
          mockServicesData.serviceGroups.forEach(group => {
            group.services.forEach(service => {
              if (service.requires_location) {
                locationServices.push(service.id);
              }
            });
          });
          setRequiresLocationServices(locationServices);
          
          setServices(mockServicesData);
        }
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Не удалось загрузить информацию о дополнительных услугах');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchServices();
  }, []);

  // Инициализируем состояние формы
  useEffect(() => {
    // Инициализируем выбранные услуги
    const initialServices = {};
    
    if (Array.isArray(formData)) {
      for (const service of formData) {
        initialServices[service] = true;
      }
    }
    
    setSelectedServices(initialServices);
    
    // Проверяем, есть ли услуги, требующие адрес
    const needsAddress = Array.isArray(formData) && formData.some(id => 
      requiresLocationServices.includes(id) || 
      (typeof id === 'string' && id.includes('pickup'))
    );
    
    console.log('Initializing additionalServices, needsAddress:', needsAddress);
  }, [formData, requiresLocationServices]);

  // Обновляем локальное состояние, если изменился prop pickupAddress
  useEffect(() => {
    setPickupAddress(initialPickupAddress);
  }, [initialPickupAddress]);

  useEffect(() => {
    if (onValidationChange) {
      // Проверяем, нужен ли адрес для выбранных услуг
      let needsAddress = false;
      let isAddressValid = true;
      
      if (Array.isArray(formData)) {
        for (const serviceId of formData) {
          if (requiresLocationServices.includes(serviceId) || 
              (typeof serviceId === 'string' && serviceId.includes('pickup'))) {
            needsAddress = true;
            if (!pickupAddress || pickupAddress.trim() === '') {
              isAddressValid = false;
              setAddressError(true);
            } else {
              setAddressError(false);
            }
            break;
          }
        }
      }
      
      if (!needsAddress) {
        setAddressError(false);
      }
      
      onValidationChange(!(needsAddress && !isAddressValid));
    }
  }, [shouldValidate, formData, pickupAddress, requiresLocationServices, onValidationChange]);

  // Обработчик изменения выбора услуги
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
    
    // Обновляем данные формы с сохранением текущего pickupAddress
    updateFormData({
      additionalServices: updatedServices,
      pickupAddress: pickupAddress // Сохраняем текущий адрес
    });
    
    // Если выбрана услуга, требующая адрес, и адрес не указан, выводим сообщение об ошибке
    if (needsAddress && (!pickupAddress || pickupAddress.trim() === '')) {
      console.log('Выбрана услуга, требующая адрес, но адрес не указан');
    }
  };
  
  // Обработчик изменения адреса
  const handleAddressChange = (event) => {
    const address = event.target.value;
    setPickupAddress(address);
    
    // Проверяем, есть ли выбранные услуги, требующие адреса
    let needsAddress = false;
    for (const serviceId of formData) {
      if (requiresLocationServices.includes(serviceId) || 
          (typeof serviceId === 'string' && serviceId.includes('pickup'))) {
        needsAddress = true;
        break;
      }
    }
    
    // Обновляем ошибку адреса
    if (needsAddress && (!address || address.trim() === '')) {
      setAddressError(true);
    } else {
      setAddressError(false);
    }
    
    // Обновляем данные формы, сохраняя существующие additionalServices
    updateFormData({
      additionalServices: formData,
      pickupAddress: address
    });
  };
  
  // Определяем, нужно ли отображать поле для адреса
  const showAddressField = formData.some(id => 
    requiresLocationServices.includes(id) || 
    (typeof id === 'string' && id.includes('pickup'))
  );

  if (isLoading) {
    return (
      <StyledPaper elevation={0}>
        <LoadingWrapper>
          <CircularProgress />
        </LoadingWrapper>
      </StyledPaper>
    );
  }

  if (error) {
    return (
      <StyledPaper elevation={0}>
        <Alert severity="error">{error}</Alert>
      </StyledPaper>
    );
  }

  return (
    <StyledPaper elevation={0}>
      <SectionTitle variant="h5">
        Дополнительные услуги
      </SectionTitle>
      
      <ServiceDescription variant="body1">
        Выберите необходимые дополнительные услуги
      </ServiceDescription>
      
      {services.serviceGroups.map((group, index) => (
        <StyledAccordion key={index} defaultExpanded={index === 0}>
          <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">{group.title}</Typography>
          </StyledAccordionSummary>
          <AccordionDetails>
            <FormGroup>
              {group.services.map((service) => (
                <div key={service.id}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={!!selectedServices[service.id]}
                        onChange={handleServiceChange(service.id)}
                        color="primary"
                      />
                    }
                    label={
                      <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                        <Typography>{service.name}</Typography>
                        <ServicePrice variant="body2">{service.price}</ServicePrice>
                      </div>
                    }
                  />
                  {service.requires_location && !!selectedServices[service.id] && (
                    <RequiresLocationBox>
                      <LocationIcon />
                      <Typography variant="body2">Требуется указать адрес забора</Typography>
                    </RequiresLocationBox>
                  )}
                </div>
              ))}
            </FormGroup>
          </AccordionDetails>
        </StyledAccordion>
      ))}
      
      {/* Поле для ввода адреса, если выбраны услуги с местоположением */}
      {Array.isArray(formData) && formData.some(serviceId => 
          requiresLocationServices.includes(serviceId) || 
          (typeof serviceId === 'string' && serviceId.includes('pickup'))) && (
        <LocationInput error={addressError}>
          <LocationTitle>
            <LocationIcon />
            Адрес для забора груза
          </LocationTitle>
          <TextField
            label="Введите полный адрес"
            value={pickupAddress}
            onChange={handleAddressChange}
            fullWidth
            multiline
            rows={2}
            error={addressError && showErrors}
            helperText={addressError && showErrors ? "Адрес обязателен для выбранных услуг" : ""}
            required
          />
        </LocationInput>
      )}
      
      {shouldValidate && addressError && (
        <Alert severity="error" style={{ marginTop: '1rem' }}>
          Для услуг забора груза необходимо указать адрес
        </Alert>
      )}
      
      <Alert severity="info" style={{ marginTop: '1rem' }}>
        Стоимость дополнительных услуг будет добавлена к итоговой сумме заказа
      </Alert>
    </StyledPaper>
  );
};

export default AdditionalServicesStep; 