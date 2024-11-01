import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {UserSoapsGrid} from '@/components/UserSoapsGrid';
import {SoapCarousel} from '@/components/SoapCarousel';

export default function Home() {
  return (
    <div className="flex flex-col gap-4 py-4 px-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink>Home</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex justify-center">
        <SoapCarousel />
      </div>
      <UserSoapsGrid />
    </div>
  );
}
