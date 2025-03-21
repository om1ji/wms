import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Grid, Paper, TextField, Alert, Typography, Box } from '@mui/material';

const StyledPaper = styled(Paper)`
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  background-color: var(--tg-theme-bg-color, #fff);
`;

const FormField = styled.div`
  margin-bottom: 1.5rem;
`;

const ClientDataStep = ({ formData, updateFormData, onValidationChange, shouldValidate, showErrors }) => {
  const [errors, setErrors] = useState({});

  // Валидация данных
  const validate = () => {
    const newErrors = {};
    const phoneRegex = /^\+?[0-9\s\-()]{10,15}$/;

    // Обязательное поле - имя клиента
    if (!formData.clientName) {
      newErrors.clientName = 'Введите имя контактного лица';
    }

    // Обязательное поле - телефон
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Введите номер телефона';
    } else if (!phoneRegex.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Введите корректный номер телефона';
    }
    
    // Компания не является обязательной
    
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    
    // Уведомляем родительский компонент о результате валидации
    if (onValidationChange) {
      onValidationChange(isValid);
    }
    
    return isValid;
  };

  // Вызываем валидацию при изменении shouldValidate или данных формы
  useEffect(() => {
    if (shouldValidate) {
      validate();
    }
  }, [shouldValidate, formData]);

  const handleChange = (field) => (event) => {
    updateFormData({
      [field]: event.target.value
    });
  };

  return (
    <StyledPaper>
      <Typography variant="h5" style={{ marginBottom: '1.5rem' }}>Контактные данные</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormField>
            <TextField
              label="Имя контактного лица"
              value={formData.clientName || ''}
              onChange={handleChange('clientName')}
              fullWidth
              required
              error={showErrors && !!errors.clientName}
              helperText={showErrors && errors.clientName}
            />
          </FormField>
        </Grid>

        <Grid item xs={12}>
          <FormField>
            <TextField
              label="Телефон"
              value={formData.phoneNumber || ''}
              onChange={handleChange('phoneNumber')}
              fullWidth
              required
              placeholder="+7 (___) ___-__-__"
              error={showErrors && !!errors.phoneNumber}
              helperText={showErrors && errors.phoneNumber}
            />
          </FormField>
        </Grid>

        <Grid item xs={12}>
          <FormField>
            <TextField
              label="Компания"
              value={formData.company || ''}
              onChange={handleChange('company')}
              fullWidth
            />
          </FormField>
        </Grid>
      </Grid>
      
      {showErrors && Object.keys(errors).length > 0 && (
        <Alert severity="error" style={{ marginTop: '1rem' }}>
          Пожалуйста, заполните все обязательные поля
        </Alert>
      )}
    </StyledPaper>
  );
};

export default ClientDataStep; 