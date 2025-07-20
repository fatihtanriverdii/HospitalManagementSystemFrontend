'use client';

import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { UserPlus, Stethoscope, Building2, Search, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const menuItems = [
    {
      title: 'Doktor ve Bölüm Tanımları',
      description: 'Doktor ve hastane bölümlerini tanımlayın',
      icon: Building2,
      href: '/departments',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Hasta Kayıt',
      description: 'Yeni hasta kaydı oluşturun',
      icon: UserPlus,
      href: '/patients/new',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      title: 'Doktor Seçimi',
      description: 'Hasta için doktor seçimi yapın',
      icon: Stethoscope,
      href: '/appointments/new',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Hasta Sorgulama',
      description: 'T.C. ile hasta bilgilerini sorgulayın',
      icon: Search,
      href: '/patients/search',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-6">
            <Stethoscope className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent mb-4">
            Hasta Kayıt Kabul Sistemi
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Modern hastane hasta kayıt ve randevu yönetim sistemi
          </p>
        </div>

        {/* Menu Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 justify-center items-stretch">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href} className="flex justify-center">
              <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm w-full max-w-xs h-[270px] flex flex-col justify-between items-center">
                <div className="flex flex-col items-center text-center space-y-6 pt-8">
                  <div className={`p-4 rounded-2xl ${item.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className={`h-8 w-8 ${item.iconColor}`} />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-center pb-6 w-full">
                  <div className={`w-full h-1 bg-gradient-to-r ${item.color} rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`} />
                  <ArrowRight className={`h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300 mt-4`} />
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">4</div>
            <div className="text-gray-600">Ana Modül</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">100%</div>
            <div className="text-gray-600">Responsive Tasarım</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
            <div className="text-gray-600">Kullanıma Hazır</div>
          </div>
        </div>
      </div>
    </div>
  );
}
