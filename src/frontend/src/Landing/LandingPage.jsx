// src/pages/Landing/LandingPage.jsx
import Navbar from '../../components/Navbar';
import Hero from '../../components/Hero';
import Features from '../../components/Features';
import Generate from '../../components/Generate';
import Customize from '../../components/Customize';
import Upload from '../../components/Upload';
import Workflow from '../../components/Workflow';
import CTA from '../../components/CTA';
import Footer from '../../components/Footer';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <Navbar />
      <section id="home">
        <Hero />
      </section>
      <section id="section1">
        <Features />
      </section>
      <Generate />
      <Customize />
      <Upload />
      <section id="how-it-works">
        <Workflow />
      </section>
      <CTA />
      <section id="contact">
        <Footer />
      </section>
    </div>
  );
};

export default LandingPage;
