import React from 'react';

type PdfSource = { uri: string; cache: boolean };

type PdfRendererProps = {
  source: PdfSource;
  style?: any;
  pdfRef?: any;
  onLoadComplete?: (numberOfPages: number) => void;
  onPageChanged?: (page: number) => void;
  onError?: (error: unknown) => void;
  enablePaging?: boolean;
  horizontal?: boolean;
  fitPolicy?: number;
  spacing?: number;
};

export default function PdfRenderer({ source, style }: PdfRendererProps) {
  return (
    <iframe
      src={source.uri}
      style={
        {
          width: '100%',
          height: '100%',
          border: 'none',
          ...(style ?? {}),
        } as React.CSSProperties
      }
      title="PDF"
    />
  );
}
