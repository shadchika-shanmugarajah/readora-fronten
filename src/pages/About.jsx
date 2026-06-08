import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Lock, BookOpen, Headphones, DollarSign, ArrowRight, ShieldCheck, Compass, CheckCircle, ShoppingBag, MessageSquare, PhoneCall } from 'lucide-react';

export default function About() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 80,
        damping: 15
      }
    },
    hover: {
      y: -8,
      scale: 1.02,
      boxShadow: '0 20px 40px rgba(99, 102, 241, 0.15)',
      borderColor: 'rgba(99, 102, 241, 0.3)',
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  };

  const phoneNumbers = [
    { number: '075 886 0234', clean: '94758860234' },
    { number: '077 445 4785', clean: '94774454785' }
  ];

  return (
    <div className="relative overflow-hidden min-h-screen py-16 bg-slate-950 text-slate-100 light:bg-slate-50 light:text-slate-900 transition-colors duration-300">
      {/* Decorative Radial Gradients */}
      <div className="absolute top-0 inset-x-0 -z-10 h-96 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-900/20 via-slate-950/0 to-slate-950/0 pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-40 left-10 w-80 h-80 rounded-full bg-brand-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        
        {/* 1. Hero Section */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center max-w-3xl mx-auto space-y-6 pt-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-brand-400 light:bg-slate-900/5 light:border-slate-900/10 light:text-brand-600">
            <Compass className="h-3.5 w-3.5" />
            <span>Our Journey</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-none font-display text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-brand-200 to-purple-300 light:from-slate-800 light:via-brand-600 light:to-purple-700">
            About Us
          </h1>
          <p className="text-xl sm:text-2xl font-semibold text-brand-300 light:text-brand-600">
            "Your trusted global bookstore for affordable and quality reading."
          </p>
          <p className="text-base sm:text-lg text-slate-400 light:text-slate-600 leading-relaxed">
            We are a modern online bookstore platform connecting readers with books from different countries. 
            Our mission is to make reading accessible, affordable, and enjoyable for everyone.
          </p>
        </motion.section>

        {/* 2. Our Mission Section */}
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-12"
        >
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-4xl font-bold font-display">Our Mission</h2>
            <p className="text-sm text-slate-400 light:text-slate-500">The core values driving our service and platform development</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Globe className="h-6 w-6 text-indigo-400" />,
                title: "Global Sourcing",
                desc: "Deliver high-quality books sourced from various countries worldwide."
              },
              {
                icon: <DollarSign className="h-6 w-6 text-emerald-400" />,
                title: "Affordable Pricing",
                desc: "Provide fair and cheap pricing options optimized for all types of readers."
              },
              {
                icon: <Lock className="h-6 w-6 text-amber-400" />,
                title: "Secure Shopping",
                desc: "Ensure a 100% reliable ordering process with verified privacy controls."
              },
              {
                icon: <BookOpen className="h-6 w-6 text-brand-400" />,
                title: "Promote Reading",
                desc: "Foster a passionate and active reading culture across the globe."
              }
            ].map((mission, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover="hover"
                className="glass-card p-6 border border-white/5 bg-white/5 backdrop-blur-lg flex flex-col justify-between h-48 hover:shadow-lg transition-all"
              >
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 w-fit light:bg-slate-900/5 light:border-slate-900/10">
                  {mission.icon}
                </div>
                <div className="space-y-1 mt-4">
                  <h3 className="font-bold text-lg light:text-slate-800">{mission.title}</h3>
                  <p className="text-xs text-slate-400 light:text-slate-500 leading-relaxed">{mission.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 3. Trust & Security Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 space-y-6 text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Verified Guarantee</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-display leading-tight">
              A Secure and Trustworthy Bookstore Experience
            </h2>
            <p className="text-slate-400 light:text-slate-600 leading-relaxed">
              We leverage direct customer communication to create a safe, transparent buying environment. 
              No hidden fees, no risky online transaction processors—just pure trust and immediate support.
            </p>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            {[
              {
                title: "100% Safe Orders",
                desc: "All orders are verified and reviewed by an admin directly before processing.",
                tag: "System Guard"
              },
              {
                title: "Verified Partners",
                desc: "We source inventory strictly from licensed, authorized international publishers.",
                tag: "Safe Sourcing"
              },
              {
                title: "Secure WhatsApp Redirection",
                desc: "Checkouts direct you safely to WhatsApp. No credit cards stored online.",
                tag: "Zero Risk"
              },
              {
                title: "Customer-First Support",
                desc: "Direct support to answer queries, modify shipments, or process request queues.",
                tag: "24/7 Human Line"
              }
            ].map((trust, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="glass-card p-6 border border-white/5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <span className="text-[10px] text-brand-400 font-bold uppercase tracking-widest">{trust.tag}</span>
                  <h4 className="font-bold text-base light:text-slate-800">{trust.title}</h4>
                  <p className="text-xs text-slate-400 light:text-slate-500 leading-relaxed">{trust.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* 4. How We Work Section */}
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-12"
        >
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-4xl font-bold font-display">How We Work</h2>
            <p className="text-sm text-slate-400 light:text-slate-500">Fast, transparent, and direct order processing flow</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { step: "01", icon: <BookOpen className="h-5 w-5 text-indigo-400" />, label: "Browse Catalog", desc: "Discover our multi-language premium book catalog." },
              { step: "02", icon: <ShoppingBag className="h-5 w-5 text-purple-400" />, label: "Add to Bag", desc: "Add chosen items to bag and confirm customer name." },
              { step: "03", icon: <MessageSquare className="h-5 w-5 text-emerald-400" />, label: "WhatsApp Click", desc: "Submit order and open WhatsApp with auto-filled message." },
              { step: "04", icon: <CheckCircle className="h-5 w-5 text-amber-400" />, label: "Admin Confirm", desc: "Admin reviews the logged invoice details immediately." },
              { step: "05", icon: <Globe className="h-5 w-5 text-rose-400" />, label: "Direct Shipping", desc: "Book is dispatched from sourcing hubs directly to your door." }
            ].map((work, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="glass-card p-5 border border-white/5 flex flex-col justify-between h-48 relative overflow-hidden"
              >
                <span className="absolute right-4 top-2 text-4xl font-black text-white/5 font-display select-none light:text-slate-900/5">{work.step}</span>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 w-fit light:bg-slate-900/5 light:border-slate-900/10">
                  {work.icon}
                </div>
                <div className="space-y-1 mt-4">
                  <h4 className="font-bold text-sm light:text-slate-800">{work.label}</h4>
                  <p className="text-[11px] text-slate-400 light:text-slate-500 leading-relaxed">{work.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 5. Why Choose Us Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative h-[350px] rounded-2xl overflow-hidden border border-brand-500/20 shadow-3d-glow"
          >
            <img 
              src="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=1000" 
              alt="Cozy library workspace" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-6">
              <h4 className="text-xl font-bold font-display text-white">Your Reading Hub</h4>
              <p className="text-xs text-brand-300">Connecting minds through international pages</p>
            </div>
          </motion.div>

          <div className="space-y-8">
            <div className="text-left space-y-2">
              <h2 className="text-3xl font-bold font-display">Why Choose Us</h2>
              <p className="text-sm text-slate-400 light:text-slate-500">Uniquely structured to benefit general readers and students alike</p>
            </div>

            <div className="space-y-4">
              {[
                { title: "🌍 Global Book Collection", desc: "Direct access to regional prints, translation editions, and bestseller copies." },
                { title: "💸 Cheap and Affordable Pricing", desc: "Direct sourcing cuts out intermediaries, allowing us to offer extremely competitive rates." },
                { title: "📱 Easy WhatsApp Ordering", desc: "No signup forms or credit card details required. Order safely in just one click." },
                { title: "⚡ High-fidelity Fast Support", desc: "Direct, personal line to administrators ensures instant solutions for orders and stock checks." }
              ].map((reason, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-brand-500/20 hover:bg-white/10 transition-all light:bg-slate-900/5 light:border-slate-900/10"
                >
                  <div className="space-y-1">
                    <h4 className="font-bold text-base light:text-slate-800">{reason.title}</h4>
                    <p className="text-xs text-slate-400 light:text-slate-500 leading-relaxed">{reason.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Contact Section (Premium Card) */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden border border-white/10 bg-slate-900/40 backdrop-blur-xl p-8 sm:p-12 shadow-3d-glow"
        >
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-brand-500/10 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-purple-500/10 blur-[100px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Contact text */}
            <div className="lg:col-span-6 space-y-4 text-left">
              <h2 className="text-3xl sm:text-4xl font-bold font-display">Need Assistance?</h2>
              <p className="text-sm text-slate-400 light:text-slate-500 max-w-md leading-relaxed">
                Have questions about pricing, bulk ordering, or delivery status? Click below to chat directly with our coordinators via WhatsApp.
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-slate-400 light:text-slate-600">
                <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-400" /> Response under 10 minutes</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-400" /> Mon - Sun (8:00 AM - 10:00 PM)</span>
              </div>
            </div>

            {/* WhatsApp Buttons */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              {phoneNumbers.map((phone, index) => (
                <div 
                  key={index} 
                  className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-brand-500/20 transition-all gap-4 light:bg-white light:border-slate-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-brand-600/20 text-brand-400 light:bg-slate-900/5 light:border-slate-900/10">
                      <PhoneCall className="h-4.5 w-4.5" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] uppercase font-bold text-slate-500">WhatsApp Line {index + 1}</p>
                      <p className="text-base font-bold text-slate-200 light:text-slate-800">{phone.number}</p>
                    </div>
                  </div>

                  <a 
                    href={`https://wa.me/${phone.clean}?text=Hi,%20I%20need%20help%20with%20your%20bookstore%20service.`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/10 active:scale-95 whitespace-nowrap"
                  >
                    <MessageSquare className="h-4 w-4 fill-current" />
                    <span>Chat on WhatsApp</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

      </div>
    </div>
  );
}
