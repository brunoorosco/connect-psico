import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { TermsContent } from "@/components/TermsOfService/TermsContent";
import { TermsLayout } from "@/components/TermsOfService/TermsLayout";
import React from "react";


const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
    <TermsLayout>
      <TermsContent />
    </TermsLayout>
  </div>
  );
};

export default Index;
