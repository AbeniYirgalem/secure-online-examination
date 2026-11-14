import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Cpu,
  Layers,
  Database,
  Users,
  CheckCircle2,
  Lock,
  ArrowRight,
} from 'lucide-react';
import PageHeading from '../components/ui/PageHeading';
import Badge from '../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function AboutPage() {
  const capabilities = [
    {
      title: 'Cryptographic Security & Identity',
      description:
        'Prepared for stateless JWT tokenization stored in secure HTTP-only cookies, combined with bcrypt salt rounds for credential confidentiality.',
      icon: Lock,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      title: 'Resilient Server Architecture',
      description:
        'Powered by Node.js & Express with rate-limiting defenses against brute-force attacks, Helmet security headers, and strict payload boundaries.',
      icon: Cpu,
      color: 'text-indigo-600 bg-indigo-50',
    },
    {
      title: 'Normalized Data Model',
      description:
        'MongoDB document structures with Mongoose schemas and strict Zod runtime payload validators, guaranteeing data integrity at the database layer.',
      icon: Database,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      title: 'Fine-Grained Role Governance',
      description:
        'Rigid role-based authorization separating Administrator governance, Instructor test creation, and Student examination taking into discrete realms.',
      icon: Users,
      color: 'text-purple-600 bg-purple-50',
    },
  ];

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeading
        title="About SOES Platform"
        description="The Secure Online Examination System is built to deliver academic rigor, session reliability, and data privacy for institutions administering digital assessments."
        badge={
          <Badge variant="primary" dot size="sm">
            Architecture & Governance
          </Badge>
        }
      />

      {/* Purpose Statement */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-8 shadow-xs mb-12">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-3">
          Institutional Purpose & Mission
        </h2>
        <div className="space-y-4 text-sm text-slate-600 leading-relaxed max-w-4xl">
          <p>
            Digital examinations require higher standards of integrity than traditional testing. The Secure Online Examination System (SOES) was designed from the ground up to solve the core challenges of remote and localized digital assessments: unauthorized collusion, identity fraud, time manipulation, and grading opacity.
          </p>
          <p>
            By combining synchronized server-authoritative timers with proactive state validation and strict role separation, SOES gives educational institutions complete confidence in the authenticity and fairness of every score generated on the platform.
          </p>
        </div>
      </div>

      {/* Main Capabilities Grid */}
      <div className="mb-12">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Core Technical Capabilities
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Engineered using modern, enterprise-ready software development practices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {capabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <Card key={cap.title} className="hover:border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${cap.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-base font-bold text-slate-900">{cap.title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">{cap.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Architecture Summary Box */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <Badge variant="info" size="sm">
              Standardized Technology Stack
            </Badge>
            <h3 className="text-2xl font-bold tracking-tight text-white">
              React + Vite Frontend & Node.js + Express Backend
            </h3>
            <p className="text-xs text-blue-100/80 leading-relaxed">
              Completely decoupled frontend and backend layers communicate through secure REST endpoints validated at runtime with Zod schemas.
            </p>
          </div>

          <Link to="/login" className="shrink-0">
            <Button size="md" variant="secondary" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Go to Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
