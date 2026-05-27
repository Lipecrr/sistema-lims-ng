import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface StatCard {
  title: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: string;
}

interface Activity {
  id: string;
  description: string;
  time: string;
  type: 'analysis' | 'sample' | 'client' | 'method';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  statCards: StatCard[] = [
    {
      title: 'Análises em Andamento',
      value: '24',
      trend: '+12%',
      trendUp: true,
      icon: 'pi-flask',
    },
    {
      title: 'Amostras Recebidas',
      value: '156',
      trend: '+8%',
      trendUp: true,
      icon: 'pi-box',
    },
    {
      title: 'Clientes Ativos',
      value: '42',
      trend: '+5%',
      trendUp: true,
      icon: 'pi-users',
    },
    {
      title: 'Métodos Disponíveis',
      value: '18',
      trend: '+2%',
      trendUp: true,
      icon: 'pi-book',
    },
  ];

  recentActivities: Activity[] = [
    {
      id: '1',
      description: 'Nova análise iniciada: #ANL-2024-001',
      time: '10 minutos atrás',
      type: 'analysis',
    },
    {
      id: '2',
      description: 'Amostra recebida: #AMS-2024-045',
      time: '30 minutos atrás',
      type: 'sample',
    },
    {
      id: '3',
      description: 'Novo cliente cadastrado: Tech Solutions Ltda',
      time: '1 hora atrás',
      type: 'client',
    },
    {
      id: '4',
      description: 'Metodologia atualizada: Cromatografia Gasosa',
      time: '2 horas atrás',
      type: 'method',
    },
    {
      id: '5',
      description: 'Análise concluída: #ANL-2024-018',
      time: '3 horas atrás',
      type: 'analysis',
    },
  ];

  quickActions = [
    { label: 'Nova Análise', icon: 'pi-plus', route: '/analises/novo' },
    { label: 'Nova Amostra', icon: 'pi-box', route: '/amostras/novo' },
    { label: 'Novo Cliente', icon: 'pi-users', route: '/clientes/novo' },
    { label: 'Nova Metodologia', icon: 'pi-book', route: '/metodologias/novo' },
  ];

  getActivityIcon(type: string): string {
    const icons: { [key: string]: string } = {
      analysis: 'pi-flask',
      sample: 'pi-box',
      client: 'pi-users',
      method: 'pi-book',
    };
    return icons[type] || 'pi-circle';
  }

  getActivityColor(type: string): string {
    const colors: { [key: string]: string } = {
      analysis: 'bg-blue-500',
      sample: 'bg-green-500',
      client: 'bg-purple-500',
      method: 'bg-orange-500',
    };
    return colors[type] || 'bg-gray-500';
  }
}
