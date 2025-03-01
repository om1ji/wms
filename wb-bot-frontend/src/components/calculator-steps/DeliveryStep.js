import React from 'react';
import styled from 'styled-components';
import { 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Paper, 
  Typography,
  CircularProgress,
} from '@mui/material';

const StyledPaper = styled(Paper)`
  padding: 2rem;
  margin-bottom: 2rem;
`;

const SectionTitle = styled(Typography)`
  margin-bottom: 2rem;
  color: var(--tg-theme-text-color, #000);
`;

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
`;

const DeliveryStep = ({ formData, updateFormData, availableWarehouses }) => {
  const handleChange = (field) => (event) => {
    const value = event.target.value;
    
    if (field === 'marketplace') {
      // При смене маркетплейса сбрасываем выбранный склад
      updateFormData({
        ...formData,
        marketplace: value,
        warehouse: ''
      });
    } else {
      updateFormData({
        ...formData,
        [field]: value
      });
    }
  };

  if (!availableWarehouses || !Array.isArray(availableWarehouses)) {
    return (
      <StyledPaper elevation={0}>
        <LoadingWrapper>
          <CircularProgress />
        </LoadingWrapper>
      </StyledPaper>
    );
  }

  // Create unique marketplaces array
  const marketplaces = Array.from(new Set(availableWarehouses.map(w => ({
    id: w.marketplace,
    name: w.marketplace_name
  })))).reduce((acc, curr) => {
    if (!acc.some(m => m.id === curr.id)) {
      acc.push(curr);
    }
    return acc;
  }, []);

  // Filter warehouses for selected marketplace
  const warehouses = formData.marketplace 
    ? availableWarehouses.filter(w => w.marketplace === formData.marketplace)
    : [];


  return (
    <StyledPaper elevation={0}>
      <SectionTitle variant="h5">
        Выберите маркетплейс, склад и дату доставки
      </SectionTitle>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Маркетплейс</InputLabel>
            <Select
              value={formData.marketplace}
              onChange={handleChange('marketplace')}
              label="Маркетплейс"
            >
              {marketplaces.map((marketplace) => (
                <MenuItem key={marketplace.id} value={marketplace.id}>
                  {marketplace.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Склад</InputLabel>
            <Select
              value={formData.warehouse}
              onChange={handleChange('warehouse')}
              label="Склад"
              disabled={!formData.marketplace}
            >
              {warehouses.map((warehouse) => (
                <MenuItem key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </StyledPaper>
  );
};

export default DeliveryStep; 