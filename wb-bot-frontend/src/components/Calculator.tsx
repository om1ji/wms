import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Container, Paper, Button, Snackbar, Alert, Typography, Box } from '@mui/material';
import DeliveryStep from './calculator-steps/DeliveryStep';
import CargoTypeStep from './calculator-steps/CargoTypeStep';
import AdditionalServicesStep from './calculator-steps/AdditionalServicesStep';
import ClientDataStep from './calculator-steps/ClientDataStep';
import Summary from './calculator-steps/Summary';
import { api } from '../api/client.tsx';
import { useNavigate } from 'react-router-dom';
import { CheckCircleOutline } from '@mui/icons-material';

interface Warehouse {
    id: number;
    name: string;
    marketplace: string;
    city: string;
    city_name: string;
    marketplace_name: string;
}

interface ContainerType {
    container_types: {
        id: string;
        label: string;
    }[];
    box_sizes: {
        id: string;
        label: string;
    }[];
    pallet_weights: {
        id: string;
        label: string;
    }[];
}

interface FormData {
  deliveryWarehouse: Warehouse | string;
  marketplace: string;
  warehouse: string;
  cargoType: string;
  selectedTypes: string[];
  quantities: Record<string, number>;
  selectedBoxSizes: string[];
  selectedPalletWeights: string[];
  customBoxSize: { length: string; width: string; height: string; };
  customPalletWeight: string;
  boxCount: string;
  palletCount: string;
  length: string;
  width: string;
  height: string;
  weight: string;
  containerType: string;
  clientName: string;
  phoneNumber: string;
  company: string;
  additionalServices: (string | number)[];
  pickupAddress: string;
}

interface StepProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  onValidationChange: (isValid: boolean) => void;
  shouldValidate: boolean;
  showErrors: boolean;
}

interface DeliveryStepProps extends StepProps {
  availableWarehouses: Warehouse[];
}

interface CargoTypeStepProps extends StepProps {
  containerTypes: ContainerType;
}

interface AdditionalServicesProps {
  formData: string[];
  pickupAddress: string;
  updateFormData: (services: string[] | { additionalServices?: string[], pickupAddress?: string }) => void;
  onValidationChange: (isValid: boolean) => void;
  shouldValidate: boolean;
  showErrors: boolean;
}

interface ClientDataStepProps extends StepProps {}

interface SummaryProps {
  formData: FormData & { orderPrice: string | null };
  priceDetails?: any;
}

const CalculatorSection = styled.section`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1rem;
  background-color: var(--tg-theme-bg-color, #fff);
`;

const FormWrapper = styled(Paper)`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: var(--tg-theme-secondary-bg-color, #f5f5f5);
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
`;

const SuccessContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
  min-height: 100vh;
`;

const SuccessIcon = styled(CheckCircleOutline)`
  color: #4caf50;
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const PriceDisplay = styled(Box)`
  padding: 1rem;
  margin-top: 1rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const steps = [
  'Выбор склада и даты',
  'Тип груза',
  'Доп. услуги',
  'Данные клиента'
];

const Calculator = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ open: false, severity: 'success' as 'success' | 'error', message: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isStepValid, setIsStepValid] = useState(true);
  const [orderResponse, setOrderResponse] = useState<any>(null);
  const [validateStep, setValidateStep] = useState(true);
  const [showErrors, setShowErrors] = useState(false);
  const [orderPrice, setOrderPrice] = useState<string | null>(null);
  const [isPriceLoading, setIsPriceLoading] = useState<boolean>(false);
  const [priceDetails, setPriceDetails] = useState<any>(null);
  
  const [formData, setFormData] = useState<FormData>({
    // Шаг 1: Доставка
    marketplace: '',
    warehouse: '',
    // Шаг 2: Тип груза
    cargoType: '',
    selectedTypes: [] as string[],
    quantities: {},
    selectedBoxSizes: [] as string[],
    selectedPalletWeights: [] as string[],
    customBoxSize: { length: '', width: '', height: '' },
    customPalletWeight: '',
    boxCount: '',
    palletCount: '',
    length: '',
    width: '',
    height: '',
    weight: '',
    containerType: '',
    // Шаг 3: Контактные данные
    clientName: '',
    phoneNumber: '',
    company: '',
    // Шаг 4: Дополнительные услуги
    additionalServices: [] as (string | number)[],
    pickupAddress: '',
    deliveryWarehouse: ''
  });

  const [availableWarehouses, setAvailableWarehouses] = useState<Warehouse[]>([]);
  const [containerTypes, setContainerTypes] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const warehousesData: Warehouse[] = await api.getWarehouses();
        setAvailableWarehouses(warehousesData || []);

        const containerTypesData = await api.getContainerTypes();
        setContainerTypes(containerTypesData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load initial data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setValidateStep(true);
    setShowErrors(false);
  }, [activeStep]);

  useEffect(() => {
    const calculateOrderPrice = async () => {
      const canCalculate = (
        (formData.marketplace && formData.warehouse) &&
        (
          (formData.selectedTypes && formData.selectedTypes.length > 0) || 
          formData.cargoType
        ) &&
        (
          (formData.cargoType === 'box' || formData.selectedTypes?.includes('Коробка')) && 
            (formData.quantities?.['Коробка'] || formData.boxCount) ||
          (formData.cargoType === 'pallet' || formData.selectedTypes?.includes('Паллета')) && 
            (formData.quantities?.['Паллета'] || formData.palletCount)
        )
      );
      
      if (!canCalculate) {
        setOrderPrice(null);
        setPriceDetails(null);
        return;
      }
      
      try {
        setIsPriceLoading(true);
        const priceResponse = await api.calculatePrice(formData);
        setOrderPrice(priceResponse.total_price);
        
        // Сохраняем детали стоимости, если они есть в ответе
        if (priceResponse.details) {
          setPriceDetails(priceResponse.details);
        }
      } catch (err) {
        console.error('Error calculating price:', err);
        setOrderPrice(null);
        setPriceDetails(null);
      } finally {
        setIsPriceLoading(false);
      }
    };
    
    calculateOrderPrice();
  }, [
    formData.marketplace,
    formData.warehouse,
    formData.cargoType,
    formData.boxCount,
    formData.palletCount,
    formData.selectedTypes,
    formData.quantities,
    formData.additionalServices,
    formData.containerType,
    formData.pickupAddress
  ]);

  const handleNext = () => {
    setValidateStep(true);
    setShowErrors(true);
    
    if (isStepValid) {
      setActiveStep((prevStep) => prevStep + 1);
      setShowErrors(false);
    } else {
      setSubmitStatus({
        open: true,
        severity: 'error',
        message: 'Пожалуйста, заполните все обязательные поля перед переходом к следующему шагу'
      });
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setShowErrors(false);
  };

  const handleSubmit = async () => {
    setValidateStep(true);
    setShowErrors(true);
    
    // Проверка обязательных полей
    const requiredFields = {
      'cargo_type': formData.cargoType,
      'phone': formData.phoneNumber,
      'client_name': formData.clientName,
    };
    
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value || value.trim() === '')
      .map(([field]) => field);
    
    if (missingFields.length > 0 || !isStepValid) {
      const fieldNames = {
        'cargo_type': 'тип груза',
        'phone': 'номер телефона',
        'client_name': 'имя клиента',
      };
      
      const missingFieldsText = missingFields
        .map(field => fieldNames[field] || field)
        .join(', ');
      
      setSubmitStatus({
        open: true,
        severity: 'error',
        message: `Пожалуйста, заполните обязательные поля: ${missingFieldsText}`
      });
      return;
    }
    
    // Проверка, есть ли услуги, требующие адрес
    const requiresAddress = formData.additionalServices.some(id => 
      (typeof id === 'string' && id.includes('pickup')) ||
      [1, 2, 3, 4].includes(Number(id))  // ID услуг забора груза
    );
    
    if (requiresAddress && (!formData.pickupAddress || formData.pickupAddress.trim() === '')) {
      setSubmitStatus({
        open: true,
        severity: 'error',
        message: 'Выбрана услуга забора груза. Пожалуйста, укажите адрес забора.'
      });
      // Возвращаемся к шагу с дополнительными услугами
      setActiveStep(2);
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const response = await api.createOrder(formData);
      setOrderResponse(response);
      
      navigate('/success', {
        state: {
          orderId: response.id,
          deliveryDate: response.deliveryDate,
          totalCost: response.totalCost
        }
      });

      setIsSuccess(true);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      
      // Проверяем сообщение об ошибке на наличие упоминания адреса
      const errorMessage = error.message || '';
      if (errorMessage.toLowerCase().includes('адрес') && errorMessage.toLowerCase().includes('не указан')) {
        setSubmitStatus({
          open: true,
          severity: 'error',
          message: 'Выбрана услуга забора груза. Пожалуйста, укажите адрес забора.'
        });
        // Возвращаемся к шагу с дополнительными услугами
        setActiveStep(2);
      } else {
        setSubmitStatus({
          open: true,
          severity: 'error',
          message: 'Произошла ошибка при создании заказа. Пожалуйста, проверьте обязательные поля и попробуйте еще раз.'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSubmitStatus(prev => ({ ...prev, open: false }));
  };

  const handleFormDataChange = (newData) => {
    console.log("Updating form data:", newData);
    
    setFormData(prev => {
      // Create the updated data object
      const updatedData = { ...prev, ...newData };
      
      // Special handling for additionalServices array and pickupAddress
      if (newData.additionalServices !== undefined) {
        updatedData.additionalServices = newData.additionalServices;
      }
      
      if (newData.pickupAddress !== undefined) {
        updatedData.pickupAddress = newData.pickupAddress;
      }
      
      return updatedData;
    });
  };

  const handleNewOrder = () => {
    setIsSuccess(false);
    setActiveStep(0);
    setFormData({
      marketplace: '',
      warehouse: '',
      cargoType: '',
      selectedTypes: [],
      quantities: {},
      selectedBoxSizes: [],
      selectedPalletWeights: [],
      customBoxSize: { length: '', width: '', height: '' },
      customPalletWeight: '',
      boxCount: '',
      palletCount: '',
      length: '',
      width: '',
      height: '',
      weight: '',
      containerType: '',
      clientName: '',
      phoneNumber: '',
      company: '',
      additionalServices: [],
      pickupAddress: '',
      deliveryWarehouse: ''
    });
  };

  const handleValidationChange = (isValid) => {
    setIsStepValid(isValid);
  };

  if (isSuccess) {
    return (
      <SuccessContainer>
        <Typography variant="h4" gutterBottom>
          🎉 Заказ успешно создан!
        </Typography>
        
        <Typography variant="body1" paragraph>
          Номер вашего заказа: <strong>{orderResponse.id}</strong>
        </Typography>
        
        {orderResponse.totalCost && (
          <Typography variant="body1" paragraph>
            Общая стоимость: {orderResponse.totalCost} ₽
          </Typography>
        )}
      </SuccessContainer>
    );
  }

  if (isLoading) {
    return (
      <CalculatorSection>
        <Container>
          <FormWrapper elevation={0}>
            <div>Loading...</div>
          </FormWrapper>
        </Container>
      </CalculatorSection>
    );
  }

  if (error) {
    return (
      <CalculatorSection>
        <Container>
          <FormWrapper elevation={0}>
            <Alert severity="error">{error}</Alert>
          </FormWrapper>
        </Container>
      </CalculatorSection>
    );
  }

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <DeliveryStep
            formData={formData}
            updateFormData={handleFormDataChange}
            availableWarehouses={availableWarehouses}
            onValidationChange={handleValidationChange}
            shouldValidate={validateStep}
            showErrors={showErrors}
          />
        );
      case 1:
        return (
          <CargoTypeStep
            formData={formData}
            updateFormData={handleFormDataChange}
            containerTypes={containerTypes}
            onValidationChange={handleValidationChange}
            shouldValidate={validateStep}
            showErrors={showErrors}
          />
        );
      case 2:
        return (
          <AdditionalServicesStep
            formData={formData.additionalServices || []}
            pickupAddress={formData.pickupAddress || ''}
            updateFormData={(data) => {
              console.log("Data from AdditionalServicesStep:", data);
              // Проверяем, что это объект с нужными полями
              if (data && typeof data === 'object') {
                // Если в данных есть additionalServices и pickupAddress
                if ('additionalServices' in data && 'pickupAddress' in data) {
                  handleFormDataChange({
                    additionalServices: data.additionalServices,
                    pickupAddress: data.pickupAddress
                  });
                }
                // Если передан только pickupAddress
                else if ('pickupAddress' in data) {
                  handleFormDataChange({
                    pickupAddress: data.pickupAddress
                  });
                }
                // Если передан только additionalServices
                else if ('additionalServices' in data) {
                  handleFormDataChange({
                    additionalServices: data.additionalServices
                  });
                }
                // Если передали массив напрямую (устаревший способ)
                else if (Array.isArray(data)) {
                  handleFormDataChange({ 
                    additionalServices: data 
                  });
                }
              }
              // Если переданы просто additionalServices как массив
              else if (Array.isArray(data)) {
                handleFormDataChange({ 
                  additionalServices: data 
                });
              }
            }}
            onValidationChange={handleValidationChange}
            shouldValidate={validateStep}
            showErrors={showErrors}
          />
        );
      case 3:
        return (
          <ClientDataStep
            formData={formData}
            updateFormData={handleFormDataChange}
            onValidationChange={handleValidationChange}
            shouldValidate={validateStep}
            showErrors={showErrors}
          />
        );
      default:
        const summaryData = {
          ...formData,
          orderPrice: orderPrice
        };
        return <Summary formData={summaryData} priceDetails={priceDetails} />;
    }
  };

  return (
    <CalculatorSection>
      <Container maxWidth="sm" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <FormWrapper elevation={0}>
          {renderStepContent()}

          {orderPrice !== null && (
            <PriceDisplay>
              <Typography variant="body1">Итоговая стоимость:</Typography>
              <Typography variant="h6" color="primary" fontWeight="bold">
                {isPriceLoading ? 'Расчет...' : `${orderPrice} ₽`}
              </Typography>
            </PriceDisplay>
          )}

          <ButtonGroup>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
            >
              Назад
            </Button>
            <Button
              variant="contained"
              onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
              color="primary"
              disabled={isSubmitting}
            >
              {activeStep === steps.length - 1 ? (isSubmitting ? 'Отправка...' : 'Отправить') : 'Далее'}
            </Button>
          </ButtonGroup>
        </FormWrapper>
        
        <Snackbar 
          open={submitStatus.open} 
          autoHideDuration={6000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={submitStatus.severity} 
            variant="filled"
          >
            {submitStatus.message}
          </Alert>
        </Snackbar>
      </Container>
    </CalculatorSection>
  );
};

export default Calculator; 