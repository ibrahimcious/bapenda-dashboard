export interface DocumentEntry {
  slug: string;
  key: string;
  title: string;
}

export const DOCUMENTS: DocumentEntry[] = [
  {
    slug: "uu-1-2022",
    key: "data/uu-no-1-tahun-2022.pdf",
    title: "UU No. 1 Tahun 2022",
  },
  {
    slug: "pp-35-2023",
    key: "data/pp-no-35-tahun-2023.pdf",
    title: "PP No. 35 Tahun 2023",
  },
];

export function getDocumentBySlug(slug: string): DocumentEntry | undefined {
  return DOCUMENTS.find((d) => d.slug === slug);
}
