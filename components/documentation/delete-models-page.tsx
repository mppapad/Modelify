import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Trash2 } from "lucide-react";
import Link from "next/link";

export function DeleteModelsPage() {
  return (
    <Card className="col-span-2 lg:col-span-1">
      <CardHeader>
        <CardTitle>Delete Models</CardTitle>
        <CardDescription>
          Learn how to delete models from your account.
        </CardDescription>
        <Button variant="ghost" size="sm" className="mr-2" asChild>
          <Link href="/dashboard/docs">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Documentation
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <p>
            To delete a model, navigate to the model's page and click the
            "Delete" button. You will be prompted to confirm your decision. Once
            a model is deleted, it cannot be recovered.
          </p>
          <p>
            <b>Important:</b> Deleting a model will also remove all associated
            data, including training data and predictions.
          </p>
          <div className="flex items-center space-x-2">
            <Trash2 className="h-4 w-4" />
            <p>Delete Model Button</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/docs">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous: Upload Models
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/docs/iframe-export">
            Next: Export as iFrame
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
