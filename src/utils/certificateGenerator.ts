import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';
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
  return date.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function escapeHtml(str: string): string {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function buildCertificateHTML(data: CertificateData): string {
  const date = formatCertificateDate(data.issuedAt);
  const certCode = getCertificateCode(data.certificateId);
  const studentName = escapeHtml(data.studentName || 'NOME COMPLETO');
  const courseTitle = escapeHtml(data.courseTitle || 'NOME DO CURSO');

  return `<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
<style>
  @page { size: A4 landscape; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }

  html, body {
    width: 297mm;
    height: 210mm;
    overflow: hidden;
    background: #fff;
    font-family: Arial, Helvetica, sans-serif;
    color: #4b5563;
  }

  body {
    display: block;
    padding: 0;
  }

  .certificate {
    position: relative;
    width: 297mm;
    height: 210mm;
    background: #fff;
    border: 12px solid #5b9bd5;
    overflow: hidden;
  }

  .watermark {
    position: absolute;
    left: 50%;
    top: 51%;
    width: 650px;
    height: 650px;
    transform: translate(-50%, -50%);
    object-fit: contain;
    opacity: 0.08;
    filter: grayscale(1);
  }

  .content {
    position: absolute;
    inset: 0;
    z-index: 2;
    text-align: center;
  }

  .title {
    position: absolute;
    top: 58px;
    left: 0;
    right: 0;
    font-family: Georgia, 'Times New Roman', serif;
    color: #5b9bd5;
    font-size: 30px;
    font-weight: 400;
    letter-spacing: 0.8px;
    text-transform: uppercase;
  }

  .certify {
    position: absolute;
    top: 240px;
    left: 0;
    right: 0;
    font-size: 16px;
    letter-spacing: 1.2px;
    text-transform: uppercase;
  }

  .student {
    position: absolute;
    top: 300px;
    left: 140px;
    right: 140px;
    color: #5b9bd5;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 38px;
    font-weight: 400;
    letter-spacing: 2.2px;
    line-height: 1.15;
    text-transform: uppercase;
  }

  .completed {
    position: absolute;
    top: 410px;
    left: 0;
    right: 0;
    font-size: 16px;
  }

  .course {
    position: absolute;
    top: 438px;
    left: 160px;
    right: 160px;
    font-size: 17px;
    font-weight: 700;
    text-transform: uppercase;
  }

  .date {
    position: absolute;
    top: 515px;
    left: 0;
    right: 0;
    font-size: 16px;
    letter-spacing: 1.6px;
    text-transform: uppercase;
  }

  .logos {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 92px;
    z-index: 3;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    padding: 0 115px;
  }

  .unicef {
    width: 130px;
    height: auto;
    object-fit: contain;
  }

  .maza {
    width: 145px;
    height: auto;
    object-fit: contain;
  }

  .footer-id {
    position: absolute;
    left: 60px;
    right: 60px;
    bottom: 24px;
    z-index: 4;
    color: #6b7280;
    font-size: 9px;
    letter-spacing: 1px;
    text-align: center;
    text-transform: uppercase;
  }

  @media print {
    html, body, .certificate {
      width: 297mm !important;
      height: 210mm !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    .certificate {
      position: fixed;
      inset: 0;
    }
  }

  @media screen and (max-width: 900px) {
    body:not(.preview-mode) { width: 100vw; height: calc(100vw * 0.707); padding: 0; background: #fff; }
    body:not(.preview-mode) .certificate {
      width: 100vw;
      height: calc(100vw * 0.707);
      border-width: 6px;
    }
    body:not(.preview-mode) .title { top: 7.3%; font-size: 15px; }
    body:not(.preview-mode) .certify { top: 30.2%; font-size: 9px; }
    body:not(.preview-mode) .student { top: 37.8%; left: 9%; right: 9%; font-size: 18px; letter-spacing: 1.2px; }
    body:not(.preview-mode) .completed { top: 51.6%; font-size: 9px; }
    body:not(.preview-mode) .course { top: 55.1%; left: 10%; right: 10%; font-size: 9px; }
    body:not(.preview-mode) .date { top: 64.8%; font-size: 9px; }
    body:not(.preview-mode) .watermark { width: 58%; height: 82%; }
    body:not(.preview-mode) .logos { bottom: 11%; padding: 0 10%; }
    body:not(.preview-mode) .unicef { width: 18%; }
    body:not(.preview-mode) .maza { width: 20%; }
    body:not(.preview-mode) .footer-id { bottom: 3%; font-size: 6px; }
  }
</style>
</head>
<body>
  <section class="certificate" aria-label="Certificado de conclusão">
    <img class="watermark" src="${MAZA_LOGO_B64}" alt=""/>
    <div class="content">
      <h1 class="title">Certificado de Conclusão</h1>
      <p class="certify">Certificamos que</p>
      <p class="student">${studentName}</p>
      <p class="completed">completou com sucesso o curso</p>
      <p class="course">${courseTitle}</p>
      <p class="date">${date}</p>
    </div>
    <div class="logos">
      <img class="unicef" src="${UNICEF_LOGO_B64}" alt="UNICEF"/>
      <img class="maza" src="${MAZA_HORIZONTAL_LOGO_B64}" alt="MAZA"/>
    </div>
    <div class="footer-id">ID do Certificado: ${certCode}</div>
  </section>
</body>
</html>`;
}

export async function downloadCertificatePDF(data: CertificateData): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      const webGenerator = await import('./certificateGenerator.web');
      await webGenerator.downloadCertificatePDF(data);
      return;
    }

    const html = buildCertificateHTML(data);

    const { uri } = await Print.printToFileAsync({
      html,
      // expo-print expects physical page dimensions in points (72 dpi), not CSS pixels.
      // A4 landscape is 297 × 210 mm = approximately 842 × 595 points.
      width: 842,
      height: 595,
      base64: false,
    });

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Guardar ou partilhar certificado',
        UTI: 'com.adobe.pdf',
      });
    } else {
      Alert.alert('PDF gerado', `Certificado guardado em:\n${uri}`);
    }
  } catch (err: any) {
    console.error('Certificate generation error:', err);
    Alert.alert('Erro', 'Não foi possível gerar o certificado. Tente novamente.');
  }
}
