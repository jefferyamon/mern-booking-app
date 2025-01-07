import Footer from "../components/Footer";
import Headers from "../components/Headers";
import Hero from "../components/Hero";

interface Props {
  children: React.ReactNode;
}

const Layouts = ({ children }: Props) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Headers />
      <Hero />
      <div className="container mx-auto py-10 flex-1">{children}</div>
      <Footer />
    </div>
  );
};
export default Layouts;
