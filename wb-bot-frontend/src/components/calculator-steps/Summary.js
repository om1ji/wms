import React from 'react';
import styled from 'styled-components';
import { Paper, Typography, Divider, Box, Skeleton } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const StyledPaper = styled(Paper)`
  padding: 2rem;
  margin-bottom: 2rem;
`;

const SectionTitle = styled(Typography)`
  margin-bottom: 2rem;
  color: var(--tg-theme-text-color, #000);
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const SectionHeader = styled(Typography)`
  margin-bottom: 1rem;
  color: var(--tg-theme-text-color, #000);
  font-weight: 500;
`;

const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const DetailLabel = styled(Typography)`
  color: #666;
`;

const DetailValue = styled(Typography)`
  color: var(--tg-theme-text-color, #000);
  font-weight: 500;
`;

const PriceSection = styled(Section)`
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px dashed #ccc;
`;

const TotalPrice = styled(Typography)`
  font-weight: bold;
  font-size: 1.2rem;
  color: var(--tg-theme-text-color, #000);
`;

const PriceSkeleton = styled(Skeleton)`
  width: 80px;
  display: inline-block;
`;

const LocationIcon = styled(LocationOnIcon)`
  margin-right: 8px;
  color: #1976d2;
  font-size: 1rem;
  vertical-align: middle;
`;

const AddressBox = styled(Box)`
  margin-top: 8px;
  padding: 12px;
  background-color: rgba(25, 118, 210, 0.05);
  border-radius: 4px;
  display: flex;
  align-items: flex-start;
`;

const Summary = ({ formData, priceDetails }) => {
  // Функция для получения названия дополнительной услуги по ID
  const getServiceNameById = (serviceId) => {
    const serviceMap = {
      // Забор груза
      'pickup_city_small': 'Забор груза по городу (1-10 коробок)',
      'pickup_city_large': 'Забор груза по городу (11+ коробок)',
      'pickup_city_pallet_small': 'Забор груза по городу (1 паллет до 500кг)',
      'pickup_city_pallet_large': 'Забор груза по городу (1 паллет 500+ кг)',
      'pickup_suburban_20km': 'Забор груза за городом до 20км',
      'pickup_suburban_50km': 'Забор груза за городом 20-50км',
      
      // Паллетирование
      'palletizing_small': 'Паллетирование (1 паллет до 1 куба)',
      'palletizing_large': 'Паллетирование (1 паллет более 1 куба)',
      
      // Услуги грузчика
      'loader_20': 'Услуги грузчика (до 20 коробок)',
      'loader_40': 'Услуги грузчика (21-40 коробок)',
      'loader_60': 'Услуги грузчика (41-60 коробок)',
      'loader_61plus': 'Услуги грузчика (61+ коробок)',
      
      // Реальные ID из базы данных
      '1': 'Забор груза (до 10 коробок)',
      '2': 'Забор груза (свыше 10 коробок)',
      '3': 'Забор груза (1 паллета до 500кг)',
      '4': 'Забор груза (1 паллета свыше 500кг)',
      '5': 'Паллетирование (до 1 куба)',
      '6': 'Паллетирование (свыше 1 куба)',
      '7': 'Услуги грузчика (до 20 коробок)',
      '8': 'Услуги грузчика (21-40 коробок)',
      '9': 'Услуги грузчика (41-60 коробок)',
      '10': 'Услуги грузчика (свыше 60 коробок)',
    };
    
    return serviceMap[serviceId] || serviceId;
  };

  // Проверка наличия выбранных дополнительных услуг
  const hasAdditionalServices = formData.additionalServices && formData.additionalServices.length > 0;
  
  // Проверка, есть ли адрес забора груза
  const hasPickupAddress = formData.pickupAddress && formData.pickupAddress.trim() !== '';
  
  // Проверка, есть ли детальная разбивка стоимости
  const hasPriceDetails = priceDetails && (
    priceDetails.delivery || 
    priceDetails.cargo || 
    priceDetails.additional_services
  );

  return (
    <StyledPaper elevation={0}>
      <SectionTitle variant="h5">
        Сводка заказа
      </SectionTitle>

      <Section>
        <SectionHeader variant="h6">Информация о доставке</SectionHeader>
        <DetailItem>
          <DetailLabel>Маркетплейс:</DetailLabel>
          <DetailValue>{formData.marketplace || 'Не указано'}</DetailValue>
        </DetailItem>
        <DetailItem>
          <DetailLabel>Склад:</DetailLabel>
          <DetailValue>{formData.warehouse || 'Не указано'}</DetailValue>
        </DetailItem>
      </Section>

      <Divider />

      <Section>
        <SectionHeader variant="h6">Информация о грузе</SectionHeader>
        <DetailItem>
          <DetailLabel>Тип груза:</DetailLabel>
          <DetailValue>{formData.cargoType || 'Не указано'}</DetailValue>
        </DetailItem>
        {formData.boxCount && (
          <DetailItem>
            <DetailLabel>Количество коробок:</DetailLabel>
            <DetailValue>{formData.boxCount}</DetailValue>
          </DetailItem>
        )}
        {formData.palletCount && (
          <DetailItem>
            <DetailLabel>Количество паллет:</DetailLabel>
            <DetailValue>{formData.palletCount}</DetailValue>
          </DetailItem>
        )}
        {formData.containerType && (
          <DetailItem>
            <DetailLabel>Тип контейнера:</DetailLabel>
            <DetailValue>{formData.containerType}</DetailValue>
          </DetailItem>
        )}
        {formData.length && formData.width && formData.height && (
          <DetailItem>
            <DetailLabel>Габариты (Д×Ш×В):</DetailLabel>
            <DetailValue>{formData.length}×{formData.width}×{formData.height} см</DetailValue>
          </DetailItem>
        )}
        {formData.weight && (
          <DetailItem>
            <DetailLabel>Вес:</DetailLabel>
            <DetailValue>{formData.weight} кг</DetailValue>
          </DetailItem>
        )}
      </Section>

      <Divider />

      <Section>
        <SectionHeader variant="h6">Контактная информация</SectionHeader>
        <DetailItem>
          <DetailLabel>Имя:</DetailLabel>
          <DetailValue>{formData.clientName || 'Не указано'}</DetailValue>
        </DetailItem>
        <DetailItem>
          <DetailLabel>Телефон:</DetailLabel>
          <DetailValue>{formData.phoneNumber || 'Не указано'}</DetailValue>
        </DetailItem>
        {formData.company && (
          <DetailItem>
            <DetailLabel>Компания:</DetailLabel>
            <DetailValue>{formData.company}</DetailValue>
          </DetailItem>
        )}
        {formData.email && (
          <DetailItem>
            <DetailLabel>Email:</DetailLabel>
            <DetailValue>{formData.email}</DetailValue>
          </DetailItem>
        )}
      </Section>

      {hasAdditionalServices && (
        <>
          <Divider />
          <Section>
            <SectionHeader variant="h6">Дополнительные услуги</SectionHeader>
            {formData.additionalServices.map((serviceId, index) => (
              <DetailItem key={index}>
                <DetailLabel>{getServiceNameById(serviceId)}</DetailLabel>
                <DetailValue>Выбрано</DetailValue>
              </DetailItem>
            ))}
            
            {hasPickupAddress && (
              <AddressBox>
                <LocationIcon />
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Адрес забора груза:</Typography>
                  <Typography variant="body2">{formData.pickupAddress}</Typography>
                </Box>
              </AddressBox>
            )}
          </Section>
        </>
      )}

      <PriceSection>
        <SectionHeader variant="h6">Итого к оплате</SectionHeader>
        
        {/* Детализация стоимости */}
        <DetailItem>
          <DetailLabel>Стоимость доставки:</DetailLabel>
          <DetailValue>
            {priceDetails?.delivery 
              ? `${priceDetails.delivery} ₽` 
              : formData.orderPrice 
                ? <PriceSkeleton animation="wave" /> 
                : 'Рассчитывается...'}
          </DetailValue>
        </DetailItem>
        
        <DetailItem>
          <DetailLabel>Стоимость обработки груза:</DetailLabel>
          <DetailValue>
            {priceDetails?.cargo 
              ? `${priceDetails.cargo} ₽` 
              : formData.orderPrice 
                ? <PriceSkeleton animation="wave" /> 
                : 'Рассчитывается...'}
          </DetailValue>
        </DetailItem>
        
        {hasAdditionalServices && (
          <DetailItem>
            <DetailLabel>Стоимость дополнительных услуг:</DetailLabel>
            <DetailValue>
              {priceDetails?.additional_services 
                ? `${priceDetails.additional_services} ₽` 
                : formData.orderPrice 
                  ? <PriceSkeleton animation="wave" /> 
                  : 'Рассчитывается...'}
            </DetailValue>
          </DetailItem>
        )}
        
        <Divider style={{ margin: '10px 0' }} />
        
        <DetailItem>
          <DetailLabel>Общая стоимость:</DetailLabel>
          <TotalPrice>{formData.orderPrice ? `${formData.orderPrice} ₽` : 'Рассчитывается...'}</TotalPrice>
        </DetailItem>
      </PriceSection>
    </StyledPaper>
  );
};

export default Summary;