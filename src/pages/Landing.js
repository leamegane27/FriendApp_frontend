import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaUsers, 
  FaShareAlt, 
  FaHeart, 
  FaComments, 
  FaMobileAlt,
  FaArrowRight,
  FaCheckCircle
} from 'react-icons/fa';
import Logo from '../components/Logo';

function Landing() {
  const features = [
    {
      icon: <FaUsers className="text-3xl text-indigo-600" />,
      title: "Connexions sociales",
      description: "Ajoutez vos amis, créez votre cercle social et restez en contact avec vos proches."
    },
    {
      icon: <FaShareAlt className="text-3xl text-indigo-600" />,
      title: "Partagez vos moments",
      description: "Publiez des photos, vidéos et textes pour partager vos moments précieux."
    },
    {
      icon: <FaHeart className="text-3xl text-indigo-600" />,
      title: "Interactions",
      description: "Aimez, commentez et partagez les publications de vos amis."
    },
    {
      icon: <FaComments className="text-3xl text-indigo-600" />,
      title: "Messages privés",
      description: "Discutez en privé avec vos amis via notre système de messagerie."
    }
  ];

  const stats = [
    { number: "10K+", label: "Utilisateurs actifs" },
    { number: "50K+", label: "Publications par jour" },
    { number: "100K+", label: "Interactions" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation simple sans Navbar */}
      <nav className="bg-white shadow-sm fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo size="sm" variant="minimal" />
            <div className="flex space-x-4">
              <Link to="/login" className="px-4 py-2 text-gray-600 hover:text-indigo-600 transition">
                Connexion
              </Link>
              <Link to="/register" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                Inscription
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <Logo size="xl" className="mb-8" />
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Connectez-vous avec
              <span className="text-indigo-600"> vos amis</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Une nouvelle façon de partager vos moments, d'interagir et de rester connecté avec vos proches.
            </p>
            <div className="flex justify-center space-x-4">
              <Link to="/register" className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center">
                Commencer maintenant
                <FaArrowRight className="ml-2" />
              </Link>
              <button className="px-8 py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition">
                En savoir plus
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-indigo-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Fonctionnalités qui font la différence
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Découvrez tout ce que FriendMobile peut vous offrir
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-indigo-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">
            Prêt à rejoindre l'aventure ?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Inscrivez-vous gratuitement et commencez à connecter avec vos amis dès maintenant.
          </p>
          <Link to="/register" className="inline-flex items-center px-8 py-3 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 transition font-semibold">
            Créer un compte gratuitement
            <FaArrowRight className="ml-2" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Logo size="sm" variant="minimal" />
              <p className="text-gray-400 mt-4 text-sm">
                Connect. Share. Together.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button className="hover:text-white">Fonctionnalités</button></li>
                <li><button className="hover:text-white">Tarifs</button></li>
                <li><button className="hover:text-white">FAQ</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button className="hover:text-white">Conditions d'utilisation</button></li>
                <li><button className="hover:text-white">Politique de confidentialité</button></li>
                <li><button className="hover:text-white">Cookies</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Suivez-nous</h4>
              <div className="flex space-x-4">
                <button className="text-gray-400 hover:text-white">Facebook</button>
                <button className="text-gray-400 hover:text-white">Twitter</button>
                <button className="text-gray-400 hover:text-white">Instagram</button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 FriendMobile. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;