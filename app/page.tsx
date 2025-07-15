import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Target } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-6  h-[calc(100vh-200px)] flex flex-col justify-center">
      < div className="text-center" >
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Bonjour Giovanni
        </h1>
        <p className="text-xl text-muted-foreground">
          Que souhaite tu faire ?
        </p>
      </div >

      <div className="grid gap-6 md:grid-cols-2 max-w-2xl mx-auto">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/modules">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Mes Modules</CardTitle>
              <CardDescription>
                Consulte et gère tes notes de modules
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center mt-4">
              <Button className="w-full" size="lg">
                Accéder aux modules
              </Button>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/competences">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
                <Target className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Compétences</CardTitle>
              <CardDescription>
                Suis tes compétences et ta progression
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center mt-4">
              <Button className="w-full" size="lg">
                Voir les compétences
              </Button>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div >
  );
}
