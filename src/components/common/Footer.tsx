import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, Github, Twitter, Mail, Heart, TrendingUp, Zap, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    },
  };

  return (
    <footer className="bg-gradient-to-br from-card via-card to-card/50 border-t border-border mt-auto relative overflow-hidden">
      {/* Animated Background Elements */}
      <motion.div
        className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div 
        ref={ref}
        className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        {/* Newsletter Section */}
        <motion.div 
          className="mb-12 p-8 rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20"
          variants={itemVariants}
        >
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              className="inline-flex items-center gap-2 mb-4"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Mail className="h-6 w-6 text-primary" />
              <h3 className="text-2xl font-bold text-foreground">
                Stay Updated
              </h3>
            </motion.div>
            <p className="text-muted-foreground mb-6">
              Get the latest AI tools delivered to your inbox weekly
            </p>
            <div className="flex gap-3 max-w-md mx-auto">
              <Input 
                type="email" 
                placeholder="Enter your email" 
                className="h-12"
              />
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button size="lg" className="h-12 bg-primary hover:bg-primary-hover">
                  Subscribe
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <motion.div 
            className="col-span-1 md:col-span-2"
            variants={itemVariants}
          >
            <div className="flex items-center gap-3 mb-4">
              <motion.div 
                className="p-2 bg-gradient-to-br from-primary to-accent rounded-xl relative overflow-hidden"
                whileHover={{ scale: 1.1, rotate: 10 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <Sparkles className="h-6 w-6 text-white relative z-10" />
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
              <div>
                <span className="text-xl font-bold text-foreground block">
                  AI Tools Hub
                </span>
                <span className="text-xs text-muted-foreground">Discover & Innovate</span>
              </div>
            </div>
            <p className="text-muted-foreground text-sm max-w-md mb-4">
              Your centralized platform for discovering the latest AI tools and innovations. 
              Stay updated with real-time tracking of newly released AI tools from across the internet.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span>Real-time Updates</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-accent" />
                <span>Trending Tools</span>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" />
              Quick Links
            </h3>
            <div className="space-y-3">
              {[
                { to: '/', label: 'Home' },
                { to: '/categories', label: 'Categories' },
                { to: '/search', label: 'Search' },
                { to: '/about', label: 'About' }
              ].map((link, index) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, x: -10 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3 + index * 0.05, duration: 0.3 }}
                >
                  <Link 
                    to={link.to} 
                    className="block text-sm text-muted-foreground hover:text-primary transition-all hover:translate-x-2 group flex items-center gap-2"
                  >
                    <span className="w-0 h-px bg-primary group-hover:w-4 transition-all duration-300"></span>
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Resources
            </h3>
            <div className="space-y-3">
              {[
                'Submit a Tool',
                'API Documentation',
                'Privacy Policy',
                'Terms of Service'
              ].map((label, index) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.4 + index * 0.05, duration: 0.3 }}
                >
                  <a 
                    href="#" 
                    className="block text-sm text-muted-foreground hover:text-primary transition-all hover:translate-x-2 group flex items-center gap-2"
                  >
                    <span className="w-0 h-px bg-primary group-hover:w-4 transition-all duration-300"></span>
                    {label}
                  </a>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div 
          className="pt-8 border-t border-border"
          variants={itemVariants}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              © {currentYear} AI Tools Hub. Made with 
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
              >
                <Heart className="h-4 w-4 text-red-500 fill-red-500" />
              </motion.span>
              for AI enthusiasts
            </p>
            <div className="flex items-center gap-4">
              <motion.a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-muted"
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
              >
                <Github className="h-5 w-5" />
              </motion.a>
              <motion.a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-muted"
                whileHover={{ scale: 1.2, rotate: -5 }}
                whileTap={{ scale: 0.9 }}
              >
                <Twitter className="h-5 w-5" />
              </motion.a>
              <motion.a 
                href="mailto:hello@aitools.com" 
                className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-muted"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                <Mail className="h-5 w-5" />
              </motion.a>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
};

export default Footer;
