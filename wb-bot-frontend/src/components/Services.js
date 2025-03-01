import React from 'react';
import styled from 'styled-components';
import { Container, Grid, Paper } from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import CalculateIcon from '@mui/icons-material/Calculate';
import TimelineIcon from '@mui/icons-material/Timeline';

const Section = styled.section`
  padding: 4rem 0;
  background-color: var(--tg-theme-secondary-bg-color, #f5f5f5);
`;

const SectionTitle = styled.h2`
  text-align: center;
  margin-bottom: 3rem;
  font-size: 2.5rem;
  color: var(--tg-theme-text-color, #333);
`;

const ServiceCard = styled(Paper)`
  padding: 2rem;
  text-align: center;
  height: 100%;
  transition: transform 0.3s ease;
  background-color: var(--tg-theme-bg-color, #fff);

  &:hover {
    transform: translateY(-5px);
  }

  .icon {
    font-size: 3rem;
    color: var(--tg-theme-button-color, #1976d2);
    margin-bottom: 1rem;
  }

  h3 {
    margin-bottom: 1rem;
    color: var(--tg-theme-text-color, #333);
  }

  p {
    color: var(--tg-theme-hint-color, #666);
  }
`;

const services = [
  {
    icon: <LocalShippingIcon className="icon" />,
    title: 'Международные перевозки',
    description: 'Организация международных грузоперевозок любой сложности'
  },
  {
    icon: <WarehouseIcon className="icon" />,
    title: 'Складская логистика',
    description: 'Полный комплекс складских услуг и ответственное хранение'
  },
  {
    icon: <CalculateIcon className="icon" />,
    title: 'Таможенное оформление',
    description: 'Профессиональное таможенное оформление грузов'
  },
  {
    icon: <TimelineIcon className="icon" />,
    title: 'Мультимодальные перевозки',
    description: 'Комбинированные перевозки различными видами транспорта'
  }
];

const Services = () => {
  return (
    <Section>
      <Container>
        <SectionTitle>Наши услуги</SectionTitle>
        <Grid container spacing={4}>
          {services.map((service, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <ServiceCard elevation={3}>
                {service.icon}
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </ServiceCard>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Section>
  );
};

export default Services; 