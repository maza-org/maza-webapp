import { jsPDF } from 'jspdf';
import { MAZA_LOGO_B64, UNICEF_LOGO_B64 } from '../assets/certificateAssets';
import { MAZA_HORIZONTAL_LOGO_B64 } from '../assets/certificateExtraAssets';

export interface CertificateData {
  studentName: string;
  courseTitle: string;
  instructor: string;
  issuedAt: string;
  courseId: string;
  certificateId: string;
}

export function getCertificateCode(certificateId: string): string {
  const cleanId = certificateId?.trim();
  return cleanId ? `MAZA-${cleanId.slice(0, 8).toUpperCase()}` : 'MAZA-PENDENTE';
}

export function formatCertificateDate(issuedAt: string): string {
  const date = issuedAt ? new Date(issuedAt) : new Date();
  if (Number.isNaN(date.getTime())) return 'DATA DE CONCLUSÃO';
  return date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' });
}

function safeFilePart(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function fitFontSize(pdf: jsPDF, text: string, preferred: number, maxWidth: number, minimum: number) {
  let size = preferred;
  pdf.setFontSize(size);
  while (size > minimum && pdf.getTextWidth(text) > maxWidth) {
    size -= 0.5;
    pdf.setFontSize(size);
  }
  return size;
}

export function buildCertificateHTML(_data: CertificateData): string {
  return '';
}

export async function downloadCertificatePDF(data: CertificateData): Promise<void> {
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });
  const pageWidth = 297;
  const pageHeight = 210;
  const student = (data.studentName || 'NOME COMPLETO').toUpperCase();
  const course = (data.courseTitle || 'NOME DO CURSO').toUpperCase();

  pdf.setProperties({
    title: `Certificado MAZA - ${data.studentName}`,
    author: 'MAZA',
    subject: `Certificado de conclusão - ${data.courseTitle}`,
  });

  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');
  pdf.setDrawColor(91, 155, 213);
  pdf.setLineWidth(3);
  pdf.rect(2.5, 2.5, pageWidth - 5, pageHeight - 5);

  const watermarkState = pdf.GState({ opacity: 0.07 });
  pdf.setGState(watermarkState);
  pdf.addImage(MAZA_LOGO_B64, 'PNG', 80, 16, 137, 178, undefined, 'FAST');
  pdf.setGState(pdf.GState({ opacity: 1 }));

  pdf.setTextColor(91, 155, 213);
  pdf.setFont('times', 'normal');
  pdf.setFontSize(24);
  pdf.text('CERTIFICADO DE CONCLUSÃO', pageWidth / 2, 28, { align: 'center' });

  pdf.setTextColor(75, 85, 99);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  pdf.text('CERTIFICAMOS QUE', pageWidth / 2, 75, { align: 'center' });

  pdf.setTextColor(91, 155, 213);
  pdf.setFont('times', 'normal');
  fitFontSize(pdf, student, 29, pageWidth - 65, 17);
  pdf.text(student, pageWidth / 2, 96, { align: 'center', maxWidth: pageWidth - 50 });

  pdf.setTextColor(75, 85, 99);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  pdf.text('completou com sucesso o curso', pageWidth / 2, 122, { align: 'center' });

  pdf.setTextColor(55, 65, 81);
  pdf.setFont('helvetica', 'bold');
  fitFontSize(pdf, course, 12, pageWidth - 65, 8);
  pdf.text(course, pageWidth / 2, 132, { align: 'center', maxWidth: pageWidth - 50 });

  pdf.setTextColor(75, 85, 99);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  pdf.text(formatCertificateDate(data.issuedAt).toUpperCase(), pageWidth / 2, 151, { align: 'center' });

  pdf.addImage(UNICEF_LOGO_B64, 'PNG', 31, 166, 40, 16, undefined, 'FAST');
  pdf.addImage(MAZA_HORIZONTAL_LOGO_B64, 'PNG', 224, 164, 43, 18, undefined, 'FAST');
  pdf.setTextColor(107, 114, 128);
  pdf.setFontSize(6.5);
  pdf.text(`ID DO CERTIFICADO: ${getCertificateCode(data.certificateId)}`, pageWidth / 2, 201, { align: 'center' });

  const filename = `Certificado_MAZA_${safeFilePart(data.studentName || 'Estudante')}_${getCertificateCode(data.certificateId)}.pdf`;
  pdf.save(filename);
}
