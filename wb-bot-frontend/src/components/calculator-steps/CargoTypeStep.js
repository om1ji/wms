import React, { useState } from 'react';
import styled from 'styled-components';
import {
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Paper,
  Typography,
  CircularProgress,
  TextField,
  Radio,
  RadioGroup,
  Grid,
  InputAdornment
} from '@mui/material';

const StyledPaper = styled(Paper)`
  padding: 2rem;
  margin-bottom: 2rem;
`;

const SectionTitle = styled(Typography)`
  margin-bottom: 2rem;
  color: var(--tg-theme-text-color, #000);
`;

const SubSectionTitle = styled(Typography)`
  margin-top: 2rem;
  margin-bottom: 1rem;
  color: var(--tg-theme-text-color, #000);
`;

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
`;

const CustomSizeField = styled(TextField)`
  margin-top: 1rem;
  margin-bottom: 1rem;
`;

const CargoTypeStep = ({ formData, updateFormData, containerTypes }) => {
  const [customBoxSize, setCustomBoxSize] = useState({ length: '', width: '', height: '' });
  const [customPalletWeight, setCustomPalletWeight] = useState('');

  const handleChange = (type) => (event) => {
    const newSelectedTypes = event.target.checked
      ? [...formData.selectedTypes, type]
      : formData.selectedTypes.filter(t => t !== type);

    updateFormData({
      selectedTypes: newSelectedTypes
    });
  };

  const handleQuantityChange = (type) => (event) => {
    const value = parseInt(event.target.value, 10) || 0;
    updateFormData({
      quantities: {
        ...formData.quantities,
        [type]: value
      }
    });
  };

  const handleBoxSizeChange = (event) => {
    const selectedSize = event.target.value;
    updateFormData({
      selectedBoxSizes: [selectedSize]
    });
  };

  const handlePalletWeightChange = (event) => {
    const selectedWeight = event.target.value;
    updateFormData({
      selectedPalletWeights: [selectedWeight]
    });
  };

  const handleCustomBoxSizeChange = (field) => (event) => {
    const newCustomSize = {
      ...customBoxSize,
      [field]: event.target.value
    };
    setCustomBoxSize(newCustomSize);
    
    // Если все поля заполнены, обновляем formData с кастомным размером
    if (newCustomSize.length && newCustomSize.width && newCustomSize.height) {
      updateFormData({
        customBoxSize: newCustomSize
      });
    }
  };

  const handleCustomPalletWeightChange = (event) => {
    const weight = event.target.value;
    setCustomPalletWeight(weight);
    updateFormData({
      customPalletWeight: weight
    });
  };

  if (!containerTypes) {
    return (
      <StyledPaper elevation={0}>
        <LoadingWrapper>
          <CircularProgress />
        </LoadingWrapper>
      </StyledPaper>
    );
  }

  return (
    <StyledPaper elevation={0}>
      <SectionTitle variant="h5">
        Выберите тип груза
      </SectionTitle>

      <FormControl component="fieldset" fullWidth>
        <FormGroup>
          {containerTypes.container_types.map((type) => (
            <div key={type.id} style={{ marginBottom: '1rem' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.selectedTypes.includes(type.id)}
                    onChange={handleChange(type.id)}
                  />
                }
                label={type.label}
              />
              {formData.selectedTypes.includes(type.id) && (
                <TextField
                  type="number"
                  label="Количество"
                  variant="outlined"
                  size="small"
                  value={formData.quantities?.[type.id] || 0}
                  onChange={handleQuantityChange(type.id)}
                  style={{ marginLeft: '2rem', width: '150px' }}
                  inputProps={{ min: 0 }}
                />
              )}
            </div>
          ))}
        </FormGroup>
      </FormControl>

      {formData.selectedTypes.includes('Коробка') && (
        <>
          <SubSectionTitle variant="h6">
            Размеры коробок
          </SubSectionTitle>
          <FormControl component="fieldset" fullWidth>
            <RadioGroup
              value={formData.selectedBoxSizes?.[0] || ''}
              onChange={handleBoxSizeChange}
            >
              {containerTypes.box_sizes.map((size) => (
                <FormControlLabel
                  key={size.id}
                  value={size.id}
                  control={<Radio />}
                  label={size.label}
                />
              ))}
            </RadioGroup>
          </FormControl>

          {formData.selectedBoxSizes?.[0] === 'Другой размер' && (
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <CustomSizeField
                  label="Длина"
                  type="number"
                  value={customBoxSize.length}
                  onChange={handleCustomBoxSizeChange('length')}
                  fullWidth
                  InputProps={{
                    endAdornment: <InputAdornment position="end">см</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={4}>
                <CustomSizeField
                  label="Ширина"
                  type="number"
                  value={customBoxSize.width}
                  onChange={handleCustomBoxSizeChange('width')}
                  fullWidth
                  InputProps={{
                    endAdornment: <InputAdornment position="end">см</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={4}>
                <CustomSizeField
                  label="Высота"
                  type="number"
                  value={customBoxSize.height}
                  onChange={handleCustomBoxSizeChange('height')}
                  fullWidth
                  InputProps={{
                    endAdornment: <InputAdornment position="end">см</InputAdornment>,
                  }}
                />
              </Grid>
            </Grid>
          )}
        </>
      )}

      {formData.selectedTypes.includes('Паллета') && (
        <>
          <SubSectionTitle variant="h6">
            Весовые категории паллет
          </SubSectionTitle>
          <FormControl component="fieldset" fullWidth>
            <RadioGroup
              value={formData.selectedPalletWeights?.[0] || ''}
              onChange={handlePalletWeightChange}
            >
              {containerTypes.pallet_weights.map((weight) => (
                <FormControlLabel
                  key={weight.id}
                  value={weight.id}
                  control={<Radio />}
                  label={weight.label}
                />
              ))}
            </RadioGroup>
          </FormControl>

          {formData.selectedPalletWeights?.[0] === 'Другой вес' && (
            <TextField
              label="Укажите вес"
              type="number"
              value={customPalletWeight}
              onChange={handleCustomPalletWeightChange}
              fullWidth
              style={{ marginTop: '1rem' }}
              InputProps={{
                endAdornment: <InputAdornment position="end">кг</InputAdornment>,
              }}
            />
          )}
        </>
      )}
    </StyledPaper>
  );
};

export default CargoTypeStep; 