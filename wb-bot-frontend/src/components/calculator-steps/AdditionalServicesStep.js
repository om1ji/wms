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
  Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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

const AdditionalServicesStep = ({ formData, updateFormData, onValidationChange, shouldValidate, showErrors }) => {
  // Дополнительные услуги необязательны, поэтому всегда валидны
  const [selectedServices, setSelectedServices] = useState({});

  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(true);
    }
  }, [shouldValidate, formData, onValidationChange]);

  useEffect(() => {
    // Инициализируем состояние из formData
    const initialServices = {};
    
    for (const service of formData) {
      initialServices[service] = true;
    }
    
    setSelectedServices(initialServices);
  }, []);

  const handleServiceChange = (serviceId) => (event) => {
    const isChecked = event.target.checked;
    
    setSelectedServices(prev => ({
      ...prev,
      [serviceId]: isChecked
    }));

    // Обновляем formData
    const updatedServices = isChecked 
      ? [...formData, serviceId] 
      : formData.filter(id => id !== serviceId);
    
    updateFormData(updatedServices);
  };

  // Группы дополнительных услуг
  const serviceGroups = [
    {
      title: 'Забор груза',
      services: [
        { id: 'pickup_city_small', name: 'Забор груза по городу (1-10 коробок)', price: '500 ₽' },
        { id: 'pickup_city_large', name: 'Забор груза по городу (11+ коробок)', price: '1000 ₽' },
        { id: 'pickup_city_pallet_small', name: 'Забор груза по городу (1 паллет до 500кг)', price: '1000 ₽' },
        { id: 'pickup_city_pallet_large', name: 'Забор груза по городу (1 паллет 500+ кг)', price: '1500 ₽' },
        { id: 'pickup_suburban_20km', name: 'Забор груза за городом до 20км', price: '2500 ₽' },
        { id: 'pickup_suburban_50km', name: 'Забор груза за городом 20-50км', price: '4000 ₽' },
      ]
    },
    {
      title: 'Паллетирование',
      services: [
        { id: 'palletizing_small', name: 'Паллетирование (1 паллет до 1 куба)', price: '400 ₽' },
        { id: 'palletizing_large', name: 'Паллетирование (1 паллет более 1 куба)', price: '500 ₽' },
      ]
    },
    {
      title: 'Услуги грузчика',
      services: [
        { id: 'loader_20', name: 'Услуги грузчика (до 20 коробок)', price: '500 ₽' },
        { id: 'loader_40', name: 'Услуги грузчика (21-40 коробок)', price: '1000 ₽' },
        { id: 'loader_60', name: 'Услуги грузчика (41-60 коробок)', price: '1500 ₽' },
        { id: 'loader_61plus', name: 'Услуги грузчика (61+ коробок)', price: '2000 ₽' },
      ]
    }
  ];

  return (
    <StyledPaper elevation={0}>
      <SectionTitle variant="h5">
        Дополнительные услуги
      </SectionTitle>
      
      <ServiceDescription variant="body1">
        Выберите необходимые дополнительные услуги
      </ServiceDescription>
      
      {serviceGroups.map((group, index) => (
        <StyledAccordion key={index} defaultExpanded={index === 0}>
          <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">{group.title}</Typography>
          </StyledAccordionSummary>
          <AccordionDetails>
            <FormGroup>
              {group.services.map((service) => (
                <FormControlLabel
                  key={service.id}
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
              ))}
            </FormGroup>
          </AccordionDetails>
        </StyledAccordion>
      ))}
      
      <Alert severity="info" style={{ marginTop: '1rem' }}>
        Стоимость дополнительных услуг будет добавлена к итоговой сумме заказа
      </Alert>
    </StyledPaper>
  );
};

export default AdditionalServicesStep; 