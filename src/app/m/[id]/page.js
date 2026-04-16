import ViewMessagePage, { generateMetadata as getMetadata } from '../../../features/view-message/ViewMessagePage';

export async function generateMetadata({ params }) {
  return getMetadata(params.id);
}

export default function Page({ params }) {
  return <ViewMessagePage id={params.id} />;
}
