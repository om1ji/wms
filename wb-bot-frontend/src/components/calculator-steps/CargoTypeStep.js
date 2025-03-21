import React, { useState, useEffect } from 'react';
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
  InputAdornment,
  Alert,
  Box,
  FormHelperText
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
  margin-top: 1.5rem;
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

const CargoTypeStep = ({ formData, updateFormData, containerTypes, onValidationChange, shouldValidate, showErrors }) => {
  const [customBoxSize, setCustomBoxSize] = useState({ length: '', width: '', height: '' });
  const [customPalletWeight, setCustomPalletWeight] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    let updatedValues = {};

    // Проверка выбора хотя бы одного типа груза
    if (!formData.selectedTypes || formData.selectedTypes.length === 0) {
      newErrors.selectedTypes = 'Выберите хотя бы один тип груза';
    } else {
      // Устанавливаем cargoType на основе выбранных типов
      if (formData.selectedTypes.includes('Коробка')) {
        updatedValues.cargoType = 'box';
      } else if (formData.selectedTypes.includes('Паллета')) {
        updatedValues.cargoType = 'pallet';
      }
    }

    // Проверка количества для каждого выбранного типа
    if (formData.selectedTypes) {
      formData.selectedTypes.forEach(type => {
        if (!formData.quantities?.[type] || formData.quantities[type] < 1) {
          newErrors[`quantity_${type}`] = 'Количество должно быть не менее 1';
        } else {
          // Устанавливаем boxCount или palletCount в зависимости от типа
          if (type === 'Коробка') {
            updatedValues.boxCount = formData.quantities[type].toString();
          } else if (type === 'Паллета') {
            updatedValues.palletCount = formData.quantities[type].toString();
          }
        }
      });
    }

    // Проверка размеров коробки
    if ((formData.selectedTypes || []).includes('Коробка')) {
      if (!formData.selectedBoxSizes || formData.selectedBoxSizes.length === 0) {
        newErrors.boxSize = 'Выберите размер коробки';
      } else if (formData.selectedBoxSizes.includes('Другой размер')) {
        if (!customBoxSize.length || !customBoxSize.width || !customBoxSize.height ||
            parseFloat(customBoxSize.length) < 1 || 
            parseFloat(customBoxSize.width) < 1 || 
            parseFloat(customBoxSize.height) < 1) {
          newErrors.customBoxSize = 'Все размеры коробки должны быть не менее 1 см';
        } else {
          // Устанавливаем размеры
          updatedValues.length = customBoxSize.length;
          updatedValues.width = customBoxSize.width;
          updatedValues.height = customBoxSize.height;
        }
      } else {
        // Устанавливаем containerType на основе выбранного размера коробки
        updatedValues.containerType = formData.selectedBoxSizes[0];
      }
    }

    // Проверка веса паллеты
    if ((formData.selectedTypes || []).includes('Паллета')) {
      if (!formData.selectedPalletWeights || formData.selectedPalletWeights.length === 0) {
        newErrors.palletWeight = 'Выберите вес паллеты';
      } else if (formData.selectedPalletWeights.includes('Другой вес')) {
        const weight = parseFloat(customPalletWeight);
        if (!customPalletWeight || weight < 1 || weight > 1000) {
          newErrors.customPalletWeight = 'Вес паллеты должен быть от 1 до 1000 кг';
        } else {
          updatedValues.weight = customPalletWeight;
        }
      } else {
        // Устанавливаем containerType на основе выбранного веса паллеты
        updatedValues.containerType = formData.selectedPalletWeights[0];
      }
    }

    // Если есть изменения в данных формы, применяем их
    if (Object.keys(updatedValues).length > 0) {
      updateFormData(updatedValues);
    }

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
  }, [shouldValidate, formData, customBoxSize, customPalletWeight]);

  const handleChange = (type) => (event) => {
    const newSelectedTypes = event.target.checked
      ? [...(formData.selectedTypes || []), type]
      : (formData.selectedTypes || []).filter(t => t !== type);

    updateFormData({
      selectedTypes: newSelectedTypes
    });
  };

  const handleQuantityChange = (type) => (event) => {
    const value = parseInt(event.target.value, 10);
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
      <Typography variant="h4" style={{ marginBottom: '1rem' }}>
        Укажите информацию о грузе
      </Typography>

      <FormControl component="fieldset" fullWidth error={showErrors && !!errors.selectedTypes}>
        <FormGroup>
          {containerTypes.container_types.map((type) => (
            <div key={type.id} style={{ marginBottom: '1rem' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={(formData.selectedTypes || []).includes(type.id)}
                    onChange={handleChange(type.id)}
                  />
                }
                label={type.label}
              />
              {(formData.selectedTypes || []).includes(type.id) && (
                <TextField
                  type="number"
                  label="Количество"
                  placeholder="1"
                  variant="outlined"
                  size="small"
                  value={formData.quantities?.[type.id]}
                  onChange={handleQuantityChange(type.id)}
                  style={{ marginLeft: '2rem', width: '150px' }}
                  inputProps={{ min: 1 }}
                  error={showErrors && !!errors[`quantity_${type.id}`]}
                  helperText={showErrors && errors[`quantity_${type.id}`]}
                />
              )}
            </div>
          ))}
        </FormGroup>
        {showErrors && errors.selectedTypes && <FormHelperText>{errors.selectedTypes}</FormHelperText>}
      </FormControl>

      {(formData.selectedTypes || []).includes('Коробка') && (
        <Box style={{ marginBottom: '2rem' }}>
          <SubSectionTitle variant="h6">
            Размеры коробок
          </SubSectionTitle>

          <Alert severity="info" style={{ margin: '1rem' }}>Вес одной коробки не должен превышать 20 кг</Alert>
          
          {showErrors && errors.boxSize && (
            <Alert severity="error" style={{ marginBottom: '1rem' }}>
              {errors.boxSize}
            </Alert>
          )}
          
          <FormControl component="fieldset" fullWidth error={showErrors && !!errors.boxSize}>
            <RadioGroup
              value={formData.selectedBoxSizes?.[0] || ''}
              onChange={handleBoxSizeChange}
              style={{ marginBottom: '1rem' }}
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
            <>
              {showErrors && errors.customBoxSize && (
                <Alert severity="error" style={{ marginBottom: '1rem' }}>
                  {errors.customBoxSize}
                </Alert>
              )}
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <CustomSizeField
                    label="Длина"
                    type="number"
                    placeholder="60"
                    value={customBoxSize.length}
                    onChange={handleCustomBoxSizeChange('length')}
                    fullWidth
                    InputProps={{
                      endAdornment: <InputAdornment position="end">см</InputAdornment>,
                    }}
                    inputProps={{ min: 1 }}
                    error={showErrors && !!errors.customBoxSize}
                  />
                </Grid>
                <Grid item xs={4}>
                  <CustomSizeField
                    label="Ширина"
                    type="number"
                    placeholder="40"
                    value={customBoxSize.width}
                    onChange={handleCustomBoxSizeChange('width')}
                    fullWidth
                    InputProps={{
                      endAdornment: <InputAdornment position="end">см</InputAdornment>,
                    }}
                    inputProps={{ min: 1 }}
                    error={showErrors && !!errors.customBoxSize}
                  />
                </Grid>
                <Grid item xs={4}>
                  <CustomSizeField
                    label="Высота"
                    type="number"
                    placeholder="40"
                    value={customBoxSize.height}
                    onChange={handleCustomBoxSizeChange('height')}
                    fullWidth
                    InputProps={{
                      endAdornment: <InputAdornment position="end">см</InputAdornment>,
                    }}
                    inputProps={{ min: 1 }}
                    error={showErrors && !!errors.customBoxSize}
                  />
                </Grid>
              </Grid>
            </>
          )}
        </Box>
      )}

      {(formData.selectedTypes || []).includes('Паллета') && (
        <>
          <SubSectionTitle variant="h6">
            Весовые категории паллет
          </SubSectionTitle>
          
          {showErrors && errors.palletWeight && (
            <Alert severity="error" style={{ marginBottom: '1rem' }}>
              {errors.palletWeight}
            </Alert>
          )}
          
          <FormControl component="fieldset" fullWidth error={showErrors && !!errors.palletWeight}>
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
            <>
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
                inputProps={{ min: 1, max: 1000 }}
                error={showErrors && !!errors.customPalletWeight}
                helperText={showErrors && errors.customPalletWeight}
              />
            </>
          )}
        </>
      )}
    </StyledPaper>
  );
};

export default CargoTypeStep; 