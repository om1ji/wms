import React from 'react';
import styled from 'styled-components';
import { Paper, Typography, Grid, Divider } from '@mui/material';

const StyledPaper = styled(Paper)`
  padding: 2rem;
  background-color: var(--tg-theme-bg-color, #fff);
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled(Typography)`
  color: var(--tg-theme-text-color, #333);
  margin-bottom: 1rem;
  font-weight: 500;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  
  .label {
    color: var(--tg-theme-hint-color, #666);
  }
  
  .value {
    color: var(--tg-theme-text-color, #333);
    font-weight: 500;
  }
`;

const StyledDivider = styled(Divider)`
  margin: 1.5rem 0;
`;

const Summary = ({ formData }) => {
  const getMarketplaceName = (code) => {
    const names = {
      'wildberries': 'Wildberries',
      'ozon': 'Ozon',
      'yandex': 'Яндекс.Маркет'
    };
    return names[code] || code;
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <StyledPaper>
      <Section>
        <SectionTitle variant="h6">Информация о доставке</SectionTitle>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <DetailRow>
              <span className="label">Маркетплейс:</span>
              <span className="value">{getMarketplaceName(formData.delivery.marketplace)}</span>
            </DetailRow>
            <DetailRow>
              <span className="label">Склад:</span>
              <span className="value">{formData.delivery.warehouse || '-'}</span>
            </DetailRow>
            <DetailRow>
              <span className="label">Город отправления:</span>
              <span className="value">{formData.delivery.fromCity || '-'}</span>
            </DetailRow>
            <DetailRow>
              <span className="label">Дата отправки:</span>
              <span className="value">{formatDate(formData.delivery.deliveryDate)}</span>
            </DetailRow>
          </Grid>
        </Grid>
      </Section>

      <StyledDivider />

      <Section>
        <SectionTitle variant="h6">Информация о грузе</SectionTitle>
        {formData.cargoType.selectedTypes.map((type) => (
          <div key={type}>
            {type === 'boxes' && formData.cargoDetails.boxes?.selectedSize && (
              <DetailRow>
                <span className="label">Коробки:</span>
                <span className="value">
                  {formData.cargoDetails.boxes.selectedSize === 'custom' 
                    ? `${formData.cargoDetails.boxes.customSize?.length}x${formData.cargoDetails.boxes.customSize?.width}x${formData.cargoDetails.boxes.customSize?.height} см`
                    : formData.cargoDetails.boxes.selectedSize
                  } - {formData.quantity.items.boxes || 0} шт.
                </span>
              </DetailRow>
            )}
            {(type === 'pallets' || type.startsWith('mono')) && formData.cargoDetails.pallets?.[type] && (
              <DetailRow>
                <span className="label">
                  {type === 'pallets' ? 'Паллеты' : `Монопаллеты (${type.slice(-1)} артикул)`}:
                </span>
                <span className="value">
                  {formData.cargoDetails.pallets[type]} - {formData.quantity.items[type] || 0} шт.
                </span>
              </DetailRow>
            )}
          </div>
        ))}
      </Section>

      <StyledDivider />

      <Section>
        <SectionTitle variant="h6">Контактная информация</SectionTitle>
        <DetailRow>
          <span className="label">Компания:</span>
          <span className="value">{formData.clientData.companyName || '-'}</span>
        </DetailRow>
        <DetailRow>
          <span className="label">Контактное лицо:</span>
          <span className="value">{formData.clientData.clientName || '-'}</span>
        </DetailRow>
        <DetailRow>
          <span className="label">Email:</span>
          <span className="value">{formData.clientData.email || '-'}</span>
        </DetailRow>
        <DetailRow>
          <span className="label">Телефон:</span>
          <span className="value">{formData.clientData.phone || '-'}</span>
        </DetailRow>
        <DetailRow>
          <span className="label">Стоимость груза:</span>
          <span className="value">{formData.clientData.cargoValue ? `${formData.clientData.cargoValue} ₽` : '-'}</span>
        </DetailRow>
        {formData.clientData.comments && (
          <DetailRow>
            <span className="label">Комментарии:</span>
            <span className="value">{formData.clientData.comments}</span>
          </DetailRow>
        )}
      </Section>
    </StyledPaper>
  );
};

export default Summary; 