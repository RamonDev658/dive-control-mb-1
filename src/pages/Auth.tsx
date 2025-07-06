import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, Mail, User, ArrowLeft } from 'lucide-react';

type AuthMode = 'login' | 'signup' | 'reset';

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, resetPassword, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || (!password && mode !== 'reset')) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      let result;
      
      switch (mode) {
        case 'login':
          result = await signIn(email, password);
          if (!result.error) {
            toast({
              title: "Sucesso",
              description: "Login realizado com sucesso!",
            });
            navigate('/');
          }
          break;
          
        case 'signup':
          result = await signUp(email, password);
          if (!result.error) {
            toast({
              title: "Cadastro realizado",
              description: "Verifique seu e-mail para confirmar a conta",
            });
            setMode('login');
          }
          break;
          
        case 'reset':
          result = await resetPassword(email);
          if (!result.error) {
            toast({
              title: "E-mail enviado",
              description: "Verifique sua caixa de entrada para redefinir a senha",
            });
            setMode('login');
          }
          break;
      }

      if (result?.error) {
        let errorMessage = "Ocorreu um erro inesperado";
        
        switch (result.error.message) {
          case 'Invalid login credentials':
            errorMessage = "E-mail ou senha incorretos";
            break;
          case 'User already registered':
            errorMessage = "Este e-mail já está cadastrado";
            break;
          case 'Password should be at least 6 characters':
            errorMessage = "A senha deve ter pelo menos 6 caracteres";
            break;
          default:
            errorMessage = result.error.message;
        }
        
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  const getTitle = () => {
    switch (mode) {
      case 'login': return 'ACESSO RESTRITO';
      case 'signup': return 'NOVO OPERADOR';
      case 'reset': return 'RECUPERAR ACESSO';
    }
  };

  const getButtonText = () => {
    switch (mode) {
      case 'login': return 'ENTRAR';
      case 'signup': return 'CADASTRAR';
      case 'reset': return 'ENVIAR E-MAIL';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-tactical flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src="/lovable-uploads/bd3b769b-6765-45a2-8fb1-d32926a10773.png" 
            alt="DiveControl Logo" 
            className="w-24 h-24 mx-auto mb-4 rounded-[15px]"
          />
          <h1 className="text-3xl font-bold text-foreground drop-shadow-lg mb-2">
            DIVECONTROL_1.0
          </h1>
          <p className="text-lg text-foreground/80 drop-shadow">
            Sistema de Controle de Mergulhos Militares
          </p>
        </div>

        <Card className="p-6 bg-gradient-command border-military-gold/30 shadow-command">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-military-gold tracking-wider">
              {getTitle()}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">
                E-mail
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  placeholder="usuario@exemplo.com"
                  required
                />
              </div>
            </div>

            {mode !== 'reset' && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              variant="tactical"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'PROCESSANDO...' : getButtonText()}
            </Button>
          </form>

          <div className="mt-6 space-y-2 text-center">
            {mode === 'login' && (
              <>
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-military-gold hover:text-military-gold/80 underline text-sm"
                >
                  Criar nova conta
                </button>
                <br />
                <button
                  type="button"
                  onClick={() => setMode('reset')}
                  className="text-muted-foreground hover:text-foreground underline text-sm"
                >
                  Esqueceu a senha?
                </button>
              </>
            )}

            {mode === 'signup' && (
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-military-gold hover:text-military-gold/80 underline text-sm flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar ao login
              </button>
            )}

            {mode === 'reset' && (
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-military-gold hover:text-military-gold/80 underline text-sm flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar ao login
              </button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Auth;