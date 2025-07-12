'use client'
import { useState } from "react";
import WelcomeSection from "./WelcomeSection";
import KpiCards from "./KpiCards";
import PendingPaymentsTable from "./PendingPaymentsTable";
import { PendingPayment } from "./types";
import PaymentModal from "./PaymentModal";

export const ReportPage = () => {
  const [selectedPayment, setSelectedPayment] = useState<PendingPayment | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const handlePaymentClick = (payment: PendingPayment) => {
    setSelectedPayment(payment);
    setIsPaymentModalOpen(true);
  };

  return (
    <div className=" bg-gray-50 dark:bg-psychology-dark/70">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <WelcomeSection />
          <KpiCards />
          {/* <PendingPaymentsTable onPaymentClick={handlePaymentClick} /> */}
        </div>
      </div>
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        payment={selectedPayment}
      />
    </div>
  );
};

export default ReportPage;
