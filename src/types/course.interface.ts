export interface ICourse {
  title: string;
  description: string;
  price: number;
  image: string;

  videos: {
    title: string;
    url: string;
  }[];
}