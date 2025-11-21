import React from 'react';
import { Sparkles, Target, Zap, Users, TrendingUp, Globe, Rocket, Shield, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FadeInWhenVisible } from '@/components/animations/FadeInWhenVisible';
import { StaggerContainer, StaggerItem } from '@/components/animations/StaggerContainer';

const AboutPage: React.FC = () => {
  const features = [
    {
      icon: <Zap className="h-8 w-8" />,
      title: 'Real-Time Updates',
      description: 'Automated hourly tracking of newly released AI tools from multiple sources including ProductHunt, TechCrunch, and more.',
      color: 'from-primary to-primary-hover',
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: 'Smart Categorization',
      description: 'Tools are automatically organized into relevant categories with intelligent tagging for easy discovery.',
      color: 'from-accent to-purple-600',
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: 'Multiple Sources',
      description: 'We aggregate data from AI directories, tech news outlets, and social platforms to ensure comprehensive coverage.',
      color: 'from-success to-green-600',
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: 'Latest Innovations',
      description: 'Stay ahead of the curve with instant access to the newest AI tools as soon as they launch.',
      color: 'from-chart-4 to-orange-600',
    },
  ];

  const values = [
    {
      icon: <Rocket className="h-6 w-6" />,
      title: 'Innovation First',
      description: 'We prioritize showcasing cutting-edge AI innovations',
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Quality Data',
      description: 'Verified and accurate information about every tool',
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: 'Community Driven',
      description: 'Built for AI enthusiasts, by AI enthusiasts',
    },
  ];

  const sources = [
    'ProductHunt',
    'TechCrunch AI',
    'The Verge AI',
    'VentureBeat AI',
    'Futurepedia',
    "There's an AI For That",
    'AItooltracker',
    'OpenFuture Tools',
    'Reddit r/artificial',
    'Reddit r/MachineLearning',
  ];

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-gradient-to-b from-primary/10 to-background py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            About AI Tools Discovery
          </h1>
          <p className="text-lg text-muted-foreground">
            Your centralized platform for discovering the latest AI innovations
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="prose prose-lg max-w-none mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Our Mission</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                AI Tools Discovery Platform was created to solve a simple problem: the AI landscape is evolving 
                so rapidly that it's nearly impossible to keep track of all the new tools being released every day.
              </p>
              <p>
                We built this platform to automatically track, aggregate, and organize information about newly 
                released AI tools from across the internet. Our goal is to provide a single, centralized location 
                where developers, researchers, and AI enthusiasts can discover the latest innovations in artificial 
                intelligence.
              </p>
              <p>
                By automating the discovery process and presenting tools in an organized, searchable format, we 
                help you stay informed about the cutting edge of AI technology without spending hours browsing 
                multiple websites and forums.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                    <div className="text-primary">{feature.icon}</div>
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            Our Data Sources
          </h2>
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground mb-6">
                We continuously monitor and aggregate data from the following trusted sources to ensure 
                comprehensive coverage of the AI tools ecosystem:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {sources.map((source, index) => (
                  <div
                    key={index}
                    className="p-3 bg-muted rounded-lg text-center text-sm font-medium text-foreground"
                  >
                    {source}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mb-4">
                  1
                </div>
                <CardTitle>Automated Scraping</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Our system automatically scrapes data from multiple sources every hour, ensuring you never 
                  miss a newly released AI tool.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mb-4">
                  2
                </div>
                <CardTitle>Smart Processing</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Tools are automatically deduplicated, categorized, and tagged using intelligent algorithms 
                  to ensure accurate organization.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mb-4">
                  3
                </div>
                <CardTitle>Easy Discovery</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Browse, search, and filter through our organized collection to find exactly the AI tools 
                  you need for your projects.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
