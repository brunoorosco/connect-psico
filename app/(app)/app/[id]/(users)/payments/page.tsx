import { getMessages } from "@/actions/messages/getMessages";
import PaymentsList from "@presentation/pages/payments";

const Payments = async () => {
//   const result = await getMessages();

//   if ("error" in result) {
//     return <div>Erro: {result.error}</div>;
//   }

  return <PaymentsList  />;
};

export default Payments;
