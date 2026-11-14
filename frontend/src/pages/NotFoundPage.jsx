import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export default function NotFoundPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="flex justify-center">
          <Badge variant="warning" dot size="sm">
            HTTP 404 Error
          </Badge>
        </div>

        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Page Not Found
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            The resource you requested cannot be located. It may have been relocated, or you may lack access permissions to this route.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/" className="w-full sm:w-auto">
            <Button size="md" variant="primary" className="w-full" leftIcon={<Home className="w-4 h-4" />}>
              Return to Home
            </Button>
          </Link>
          <Link to="/about" className="w-full sm:w-auto">
            <Button size="md" variant="secondary" className="w-full">
              About Platform
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
