import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Container, Paper, Button, Snackbar, Alert, Typography } from '@mui/material';
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

const steps = [
  'Выбор склада и даты',
  'Тип груза',
  'Доп. услуги',
  'Данные клиента'
];

const Calculator = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ open: false, severity: 'success', message: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    delivery: {
      marketplace: '',
      warehouse: '',
      fromCity: '',
      deliveryDate: null
    },
    cargoType: {
      selectedTypes: [],
      selectedBoxSizes: [],
      selectedPalletWeights: [],
      quantities: {},
      customBoxSize: { length: '', width: '', height: '' },
      customPalletWeight: ''
    },
    additionalServices: [],
    clientData: {
      companyName: '',
      clientName: '',
      email: '',
      phone: '',
      cargoValue: '',
      comments: '',
      telegram_user_id: 0
    }
  });

  const [availableWarehouses, setAvailableWarehouses] = useState<Warehouse[]>([]);
  const [containerTypes, setContainerTypes] = useState<ContainerType | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const warehousesData: Warehouse[] = await api.getWarehouses();
        setAvailableWarehouses(warehousesData || []);

        const containerTypesData: ContainerType = await api.getContainerTypes();
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

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      const orderResponse = await api.createOrder(formData);
      
      navigate('/success', {
        state: {
          orderId: orderResponse.id,
          deliveryDate: orderResponse.deliveryDate,
          totalCost: orderResponse.totalCost
        }
      });
      
    } catch (error) {
      console.error('Error submitting form:', error);
      
      setSubmitStatus({
        open: true,
        severity: 'error',
        message: 'Произошла ошибка при создании заказа. Пожалуйста, попробуйте еще раз.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSubmitStatus(prev => ({ ...prev, open: false }));
  };

  const updateFormData = (step, data) => {
    setFormData(prev => ({
      ...prev,
      [step]: {
        ...prev[step],
        ...data
      }
    }));
  };

  const handleNewOrder = () => {
    setIsSuccess(false);
    setActiveStep(0);
    setFormData({
      delivery: {
        marketplace: '',
        warehouse: '',
        fromCity: '',
        deliveryDate: null
      },
      cargoType: {
        selectedTypes: [],
        selectedBoxSizes: [],
        selectedPalletWeights: [],
        quantities: {},
        customBoxSize: { length: '', width: '', height: '' },
        customPalletWeight: ''
      },
      additionalServices: [],
      clientData: {
        companyName: '',
        clientName: '',
        email: '',
        phone: '',
        cargoValue: '',
        comments: '',
        telegram_user_id: 515588435
      }
    });
  };

  if (isSuccess) {
    return (
      <SuccessContainer>
        <SuccessIcon />
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

        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleNewOrder}
          style={{ marginTop: '2rem' }}
        >
          Создать новый заказ
        </Button>
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
            formData={formData.delivery}
            updateFormData={(data) => updateFormData('delivery', data)}
            availableWarehouses={availableWarehouses}
            />
        );
      case 1:
        return (
          <CargoTypeStep
            formData={formData.cargoType}
            updateFormData={(data) => updateFormData('cargoType', data)}
            containerTypes={containerTypes}
          />
        );
      case 2:
        return (
          <AdditionalServicesStep
            formData={formData.additionalServices}
            updateFormData={(data) => updateFormData('additionalServices', data)}
          />
        );
      case 3:
        return (
          <ClientDataStep
            formData={formData.clientData}
            updateFormData={(data) => updateFormData('clientData', data)}
          />
        );
      default:
        return <Summary formData={formData} />;
    }
  };

  return (
    <CalculatorSection>
      <Container maxWidth="sm" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <FormWrapper elevation={0}>
          {renderStepContent()}

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