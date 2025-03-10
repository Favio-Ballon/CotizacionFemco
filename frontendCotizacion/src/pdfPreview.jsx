import { useState, useRef, useEffect } from "react";
import { FaPrint, FaWhatsapp } from "react-icons/fa";
import { format } from "date-fns";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useParams } from "react-router-dom";
import ModalTelefono from "./components/modalTelefono.jsx";
import { BACKEND_URL } from "./main.jsx";
import OverlayLoading from "./components/OverlayLoading.jsx";

const QuotationDocument = () => {
  const token = localStorage.getItem("token");
  const [currentDate] = useState(new Date());
  const quotationRef = useRef(null); // Ref to capture the HTML content
  const { id } = useParams();
  const [loading, setLoading] = useState(true);

  const [companyDetails, setCompanyDetails] = useState({
    name: "FEMCO",
    address: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    email: "",
    phone: "",
    firma: "",
  });

  const [clientInfo, setClientInfo] = useState({
    name: "",
    location: "",
    quotedBy: "",
  });

  const [products, setProducts] = useState([]);

  const [imagen, setImagen] = useState();

  const [conditions, setConditions] = useState([
    "Precios expresados en bolivianos incluyen todos los Impuestos de Ley",
    "Tiempo de entrega de 3-5 dias",
    "Forma de pago: 100% para pedido",
    "Validez de la oferta: 7 días",
    "No incluye transporte",
  ]);

  const [extras, setExtras] = useState({});

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    getDatosCotizacion();
  }, [id]);

  const getDatosCotizacion = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/cotizacion/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      console.log(data);
      setClientInfo({
        name: data.nombre,
        location: "Santa Cruz",
        quotedBy: data.usuario?.nombre + " " + data.usuario?.apellido,
      });

      // product may be a single item or an array of items
      var products = [];
      var index = 0;
      for (const product of data.productos) {
        index += 1;
        products.push({
          itemNo: index,
          catalogNo: product.catalogo,
          model: product.modelo.nombre,
          description: product.nombre,
          quantity: product.producto_cotizacion.cantidad,
          unitPrice: product.precio,
          totalPrice: product.precio * product.producto_cotizacion.cantidad,
        });
      }

      setProducts(products);

      setCompanyDetails({
        name: "FEMCO",
        address: data.usuario?.direccion,
        email: data.usuario?.correo,
        phone: data.usuario?.telefono,
        firma: data.usuario.firma,
      });

      var formaPago = "";
      switch (data.formaPago) {
        case "100":
          formaPago = "100% para pedido";
          break;
        case "50":
          formaPago = "50% para pedido y 50% a la entrega";
          break;
        case "credito15":
          formaPago = "15 días de crédito";
          break;
        case "credito30":
          formaPago = "30 días de crédito";
          break;
        default:
          formaPago = "100% para pedido";
          break;
      }

      setConditions([
        "Precios expresados en bolivianos incluyen todos los Impuestos de Ley",
        data.tiempoEntrega === "inmediata"
          ? "Tiempo de entrega inmediata"
          : `Tiempo de entrega de ${data.tiempoEntrega} dias`,
        "Forma de pago: " + formaPago,
        "Validez de la oferta: 7 días",
        data.transporte ? "Incluye transporte" : "No incluye transporte",
      ]);

      setExtras({
        descuento: data.descuento,
        agregado: data.agregado,
        observaciones: data.observaciones,
      });

      setImagen(data.imagen ? data.imagen : "");

      document.title = `Cotizacion - ${clientInfo.name}`;
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePrint = async () => {
    const element = quotationRef.current; // Get the HTML content
    const pdf = new jsPDF({
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    });

    const pageHeight = pdf.internal.pageSize.getHeight(); // Height of a single PDF page
    const margin = 0; // Margin in mm
    const scale = 2; // Scale for better quality
    const footerHeight = 30;

    const captureAndAddPage = async (section, yOffset = 0) => {
      const canvas = await html2canvas(section, {
        scale: scale,
        useCORS: true,
        allowTaint: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth() - 2 * margin; // Width of the PDF page minus margins
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width; // Calculate height to maintain aspect ratio

      if (yOffset + imgHeight > pageHeight - footerHeight) {
        // If the content exceeds the page height, add a new page
        pdf.addPage();
        yOffset = 0; // Reset yOffset for the new page
      }

      pdf.addImage(
        imgData,
        "PNG",
        margin,
        yOffset,
        pdfWidth,
        imgHeight,
        undefined,
        "FAST"
      );
      return yOffset + imgHeight; // Return the new yOffset for the next chunk
    };

    let yOffset = 0; // Track the vertical position on the PDF page

    // Capture and add each section of the content
    const sections = element.querySelectorAll(".section");
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      yOffset = await captureAndAddPage(section, yOffset);
    }

    pdf.save(
      `Cotizacion_${clientInfo.name}_${format(currentDate, "yyyyMMdd")}.pdf`
    );
  };
  const HeaderComponent = () => (
    <div className="bg-[#1b1464] text-white p-6 print:bg-[#1b1464] print:text-white section rounded-t-lg">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">{companyDetails.name}</h1>
          <div className="text-sm space-y-1">
            <p>{companyDetails.address}</p>
            <p>Email: {companyDetails.email}</p>
            <p>Telefono: {companyDetails.phone}</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-semibold">Cotizacion</h2>
          <p className="text-xl mt-2">#{id}</p>
        </div>
      </div>
    </div>
  );

  const ClientInfoComponent = () => (
    <div className="bg-gray-50 p-6 border-b print:bg-gray-50 section rounded-b-lg">
      <div className="grid grid-cols-2 gap-4">
        {/* center height */}
        <div className="space-y-2 my-auto">
          <h3 className="font-semibold mb-2 text-xl">
            Cliente: {clientInfo.name}
          </h3>
        </div>
        <div className="text-right">
          <p className="text-gray-700">
            Fecha: {format(currentDate, "dd/MM/yyyy")}
          </p>
          <p className="text-gray-700">Cotizado por: {clientInfo.quotedBy}</p>
        </div>
      </div>
    </div>
  );

  const ProductTableComponent = () => {
    return (
      <div className="p-6 overflow-x-auto">
        <div className="print:overflow-x-hidden">
          <table className="w-full text-sm marginx-auto mt-3">
            <thead className="section">
              <tr className="bg-gray-100 print:bg-gray-100 rounded-xl">
                <th className="p-3 text-center">Ítem</th>
                <th className="p-3 text-center">Catálogo</th>
                <th className="p-3 text-center">Modelo</th>
                <th className="p-3 text-center">Descripción</th>
                <th className="p-3 text-center">Cantidad</th>
                <th className="p-3 text-center">Precio Unitario (Bs.)</th>
                <th className="p-3 text-center">Total (Bs.)</th>
              </tr>
            </thead>
            {products.map((product) => (
              <tbody
                className="bg-white divide-y divide-gray-200 section"
                key={product.itemNo}
              >
                <tr
                  className="border-b hover:bg-gray-50 transition-colors print:border-b"
                  style={{ pageBreakInside: "avoid" }}
                >
                  <td className="p-3 text-center">{product.itemNo}</td>
                  <td className="p-3 text-center">{product.catalogNo}</td>
                  <td className="p-3 text-center">{product.model}</td>
                  <td className="px-2 py-4 whitespace-wrap break-words max-w-[150px]">
                    {product.description}
                  </td>
                  <td className="p-3 text-center">{product.quantity}</td>
                  <td className="p-3 text-center">
                    {product.unitPrice.toFixed(2)}
                  </td>
                  <td className="p-3 text-center">
                    {product.totalPrice.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            ))}
          </table>
        </div>
      </div>
    );
  };

  const TotalComponent = () => {
    const subtotal = products.reduce(
      (sum, product) => sum + product.totalPrice,
      0
    );
    const descuento = (subtotal * extras.descuento) / 100;
    const agregado = (subtotal * extras.agregado) / 100;
    const total = subtotal + agregado - descuento;
    return (
      <div
        style={{ pageBreakInside: "avoid" }}
        className="p-6 bg-gray-50 print:bg-gray-50 section"
      >
        <div className="flex-column justify-end items-center">
          {extras.descuento > 0 && (
            <>
              <div className="flex justify-end">
                <p className="text-mg font-semibold pr-2">Subtotal:</p>
                <p className="text-mg font-bold text-[#1b1464] print:text-[#1b1464]">
                  {subtotal.toFixed(2)} Bs.
                </p>
              </div>

              <div className="flex justify-end">
                <p className="text-mg font-semibold pr-2">Descuento:</p>
                <p className="text-mg font-bold text-[#1b1464] print:text-[#1b1464]">
                  {descuento.toFixed(2)} Bs. ({extras.descuento}%)
                </p>
              </div>
            </>
          )}
          <div className="flex justify-end">
            <p className="text-xl font-semibold pr-2 my-auto">Total:</p>
            <p className="text-3xl font-bold text-[#1b1464] print:text-[#1b1464]">
              {total.toFixed(2)} Bs.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const observacionesComponent = () => (
    <div
      className="p-6 bg-white print:bg-white force-new-page grid  grid-cols-2 section"
      style={{ pageBreakInside: "avoid" }}
    >
      <div className="col-span-1">
        <h3 className="font-semibold mb-4">OBSERVACIONES</h3>
        <p className="text-gray-700">{extras.observaciones}</p>
      </div>
    </div>
  );

  const ConditionsComponent = () => (
    <div
      className="p-6 bg-white print:bg-white force-new-page grid  grid-cols-2 section"
      style={{ pageBreakInside: "avoid" }} // Avoid breaking inside this section
    >
      <div className="col-span-1">
        <h3 className="font-semibold mb-4">CONDICIONES GENERALES DE VENTA</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          {conditions.map((condition, index) => (
            <li className="whitespace-wrap" key={index}>
              {condition}
            </li>
          ))}
        </ul>
      </div>

      {/* firma a la derecha */}
      <div className="flex justify-end mt-8 col-span-1">
        {/* image */}
        <div className="w-1/2 mr-4 relative m-auto">
          <img
            src={BACKEND_URL + "/uploads/firmas/" + companyDetails.firma}
            alt="firma"
            className="h-30 w-40 m-auto absolute left-1/2 bottom-px transform -translate-x-1/2 z-0"
          />
          <p className="border-t text-center  text-gray-700 ml-4 mt-0 pt-2 relative z-10">
            {clientInfo.quotedBy}
          </p>
        </div>
      </div>
    </div>
  );
  const FooterComponent = () => (
    <div
      className="flex justify-center items-center print:bg-white section"
      style={{ height: "40.33vh" }} // Altura definida como 1/3 de la página
    >
      <img
        src={`${BACKEND_URL}/uploads/cotizacion/${imagen}`}
        alt="Locker"
        className="h-full object-contain" // Imagen ajustada al tamaño del contenedor
      />
    </div>
  );

  const handleWhatsAppShare = async () => {
    handlePrint(); // Generate the PDF
    setIsModalOpen(true); // Open the modal to ask for the phone number
  };

  const handlePhoneNumberSubmit = (phoneNumber) => {
    if (phoneNumber) {
      const whatsappUrl = `https://api.whatsapp.com/send?phone=591${phoneNumber}&text=Buenas,%20aqui%20esta%20su%20cotizacion.`;
      window.open(whatsappUrl, "_blank");
    }
    setIsModalOpen(false); // Close the modal
  };
  return (
    <div className="max-w-5xl mx-auto my-8 bg-white rounded-lg shadow-lg print:shadow-none">
      <style>
        {`
          @media print {
            @page {
              size: A4;
              margin: 0;
            }
            body {
              margin: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .force-new-page {
              page-break-before: always;
            }
          }
        `}
      </style>
      <div className="print:hidden mb-4 flex justify-end">
        <button
          onClick={handlePrint}
          className="bg-[#1b1464] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90 transition-colors mr-2"
        >
          <FaPrint />
          Descargar PDF
        </button>
        <button
          onClick={handleWhatsAppShare}
          className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90 transition-colors"
        >
          <FaWhatsapp />
          Compartir por WhatsApp
        </button>
      </div>
      <div ref={quotationRef}>
        <HeaderComponent />
        <ClientInfoComponent />
        <ProductTableComponent />
        <TotalComponent />
        {extras.observaciones && observacionesComponent()}
        <ConditionsComponent />
        {imagen && <FooterComponent />}
      </div>

      {/* Modal for phone number input */}
      <ModalTelefono
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handlePhoneNumberSubmit}
      />

      <OverlayLoading
        isOpen={loading}
        message={"Cargando cotizacion..."}
        additionalMessage={""}
        size={"medium"}
        backgroundColor={"rgba(0, 0, 0, 0.5)"}
        textColor={"text-white"}
      />
    </div>
  );
};
export default QuotationDocument;
