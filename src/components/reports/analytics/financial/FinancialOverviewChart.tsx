
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface FinancialOverviewChartProps {
  title: string;
  description: string;
  chartData: any[];
}

export const FinancialOverviewChart: React.FC<FinancialOverviewChartProps> = ({ 
  title, 
  description, 
  chartData 
}) => {
  const isEmpty = !chartData || chartData.length === 0;
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {isEmpty ? (
          <Alert className="bg-muted/50">
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>No financial data available</AlertTitle>
            <AlertDescription>
              Financial data will appear here once it's recorded. Please select a different time period or add financial records.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                width={500}
                height={300}
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" name="Revenue" fill="#22c55e" />
                <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" />
                <Bar dataKey="profit" name="Profit" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
