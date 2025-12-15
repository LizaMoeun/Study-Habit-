import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Copy, RotateCcw, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export function DemoCredentials() {
  const [copied, setCopied] = useState<string | null>(null);

  const credentials = [
    {
      type: 'Student Demo',
      email: 'student@studyhabit.com',
      password: 'student123',
      emoji: '🎓',
      color: 'blue'
    },
    {
      type: 'Admin Demo',
      email: 'admin@studyhabit.com',
      password: 'admin123',
      emoji: '👨‍💼',
      color: 'purple'
    }
  ];

  const copyToClipboard = (text: string, label: string) => {
    // Try modern Clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text)
        .then(() => {
          setCopied(label);
          setTimeout(() => setCopied(null), 2000);
          
          toast.success('📋 Copied!', {
            description: `${label} copied to clipboard`,
            duration: 2000,
          });
        })
        .catch(() => {
          // Fallback if clipboard fails
          fallbackCopy(text, label);
        });
    } else {
      // Use fallback for non-secure contexts
      fallbackCopy(text, label);
    }
  };

  const fallbackCopy = (text: string, label: string) => {
    // Create temporary textarea
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-999999px';
    textarea.style.top = '-999999px';
    document.body.appendChild(textarea);
    
    try {
      textarea.focus();
      textarea.select();
      const successful = document.execCommand('copy');
      
      if (successful) {
        setCopied(label);
        setTimeout(() => setCopied(null), 2000);
        
        toast.success('📋 Copied!', {
          description: `${label} copied to clipboard`,
          duration: 2000,
        });
      } else {
        // If copy still fails, just show the text selected
        toast.info('💡 Text Selected', {
          description: `Press Ctrl+C to copy the ${label.toLowerCase()}`,
          duration: 3000,
        });
      }
    } catch (err) {
      // Last resort - just notify user
      toast.info('💡 Copy Manually', {
        description: `Please copy: ${text}`,
        duration: 4000,
      });
    } finally {
      document.body.removeChild(textarea);
    }
  };

  const resetStorage = () => {
    if (confirm('⚠️ This will reset all demo data and reload the page. Continue?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <Card className="fixed bottom-4 left-4 w-80 shadow-xl border-2 border-blue-300 bg-white/95 backdrop-blur-sm z-50 p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm text-slate-700">🔑 Demo Credentials</h3>
          <Button
            onClick={resetStorage}
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-slate-600 hover:text-red-600"
            title="Reset localStorage"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="space-y-2">
          {credentials.map((cred) => (
            <div
              key={cred.type}
              className={`p-3 rounded-lg border-2 ${
                cred.color === 'blue'
                  ? 'border-blue-200 bg-blue-50/50'
                  : 'border-purple-200 bg-purple-50/50'
              }`}
            >
              <div className="text-xs mb-2 flex items-center gap-1">
                <span>{cred.emoji}</span>
                <span className="font-medium text-slate-700">{cred.type}</span>
              </div>
              
              <div className="space-y-1.5">
                <div className="flex items-center gap-1">
                  <code className="text-xs bg-white px-2 py-1 rounded border flex-1 text-slate-700">
                    {cred.email}
                  </code>
                  <button
                    onClick={() => copyToClipboard(cred.email, 'Email')}
                    className="p-1 hover:bg-white rounded transition-colors"
                    title="Copy email"
                  >
                    {copied === 'Email' ? (
                      <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </button>
                </div>
                
                <div className="flex items-center gap-1">
                  <code className="text-xs bg-white px-2 py-1 rounded border flex-1 text-slate-700">
                    {cred.password}
                  </code>
                  <button
                    onClick={() => copyToClipboard(cred.password, 'Password')}
                    className="p-1 hover:bg-white rounded transition-colors"
                    title="Copy password"
                  >
                    {copied === 'Password' ? (
                      <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-500 text-center pt-1">
          Using localStorage mode
        </p>
      </div>
    </Card>
  );
}