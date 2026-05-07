import React from 'react';
import Pdf from 'react-native-pdf';

type PdfSource = { uri: string; cache: boolean };

type PdfRendererProps = {
  source: PdfSource;
  style: any;
  pdfRef?: any;
  onLoadComplete?: (numberOfPages: number) => void;
  onPageChanged?: (page: number) => void;
  onError?: (error: unknown) => void;
  enablePaging?: boolean;
  horizontal?: boolean;
  fitPolicy?: number;
  spacing?: number;
};

export default function PdfRenderer({
  source,
  style,
  pdfRef,
  onLoadComplete,
  onPageChanged,
  onError,
  enablePaging,
  horizontal,
  fitPolicy,
  spacing,
}: PdfRendererProps) {
  return (
    <Pdf
      ref={pdfRef}
      source={source}
      style={style}
      trustAllCerts={false}
      onLoadComplete={onLoadComplete}
      onPageChanged={onPageChanged}
      onError={onError}
      enablePaging={enablePaging}
      horizontal={horizontal}
      fitPolicy={fitPolicy}
      spacing={spacing}
    />
  );
}
