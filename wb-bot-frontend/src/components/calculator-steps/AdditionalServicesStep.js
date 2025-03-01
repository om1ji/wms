import React from 'react';
import styled from 'styled-components';
import { Paper, Typography } from '@mui/material';

const StyledPaper = styled(Paper)`
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  background-color: var(--tg-theme-bg-color, #fff);
`;

const Message = styled(Typography)`
  color: var(--tg-theme-text-color, #666);
`;

const AdditionalServicesStep = ({ formData, updateFormData }) => {
  return (
    <StyledPaper>
      <Message variant="body1">
        Дополнительные услуги временно недоступны
      </Message>
    </StyledPaper>
  );
};

export default AdditionalServicesStep; 