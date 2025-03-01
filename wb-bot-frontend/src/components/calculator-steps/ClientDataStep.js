import React from 'react';
import styled from 'styled-components';
import { Grid, Paper, TextField } from '@mui/material';

const StyledPaper = styled(Paper)`
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  background-color: var(--tg-theme-bg-color, #fff);
`;

const FormField = styled.div`
  margin-bottom: 1.5rem;
`;

const ClientDataStep = ({ formData, updateFormData }) => {
  const handleChange = (field) => (event) => {
    updateFormData({
      [field]: event.target.value
    });
  };

  return (
    <StyledPaper>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormField>
            <TextField
              label="Название компании"
              value={formData.companyName || ''}
              onChange={handleChange('companyName')}
              fullWidth
              required
            />
          </FormField>
        </Grid>

        <Grid item xs={12}>
          <FormField>
            <TextField
              label="Имя контактного лица"
              value={formData.clientName || ''}
              onChange={handleChange('clientName')}
              fullWidth
              required
            />
          </FormField>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormField>
            <TextField
              label="Email"
              type="email"
              value={formData.email || ''}
              onChange={handleChange('email')}
              fullWidth
              required
            />
          </FormField>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormField>
            <TextField
              label="Телефон"
              value={formData.phone || ''}
              onChange={handleChange('phone')}
              fullWidth
              required
              placeholder="+7 (___) ___-__-__"
            />
          </FormField>
        </Grid>

        <Grid item xs={12}>
          <FormField>
            <TextField
              label="Стоимость груза"
              type="number"
              value={formData.cargoValue || ''}
              onChange={handleChange('cargoValue')}
              fullWidth
              required
              InputProps={{
                endAdornment: '₽'
              }}
            />
          </FormField>
        </Grid>

        <Grid item xs={12}>
          <FormField>
            <TextField
              label="Комментарии"
              value={formData.comments || ''}
              onChange={handleChange('comments')}
              fullWidth
              multiline
              rows={4}
            />
          </FormField>
        </Grid>
      </Grid>
    </StyledPaper>
  );
};

export default ClientDataStep; 