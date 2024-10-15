"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { gql, useMutation } from "@apollo/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ADD_MUTATION = gql`
  mutation AddIngredient($input: IngredientInput!) {
    addIngredient(input: $input) {
      id
    }
  }
`;

type EditIngredientInput = {
  name: string;
  slug: string;
  type: string;
};

export function EditIngredientForm({ ingredient }) {
  const router = useRouter();
  const form = useForm<EditIngredientInput>({
    defaultValues: ingredient,
  });
  const [addIngredient, { loading, error }] = useMutation(ADD_MUTATION, {
    onCompleted: () => {
      router.push("/");
    },
  });
  /*
   */

  const onSubmit = (data) => {
    if (!ingredient) {
      addIngredient({
        variables: {
          input: data,
        },
      });
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
      <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
        <Card x-chunk="dashboard-07-chunk-0">
          <CardHeader>
            <CardTitle>Edit Ingredient Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      type="text"
                      name="name"
                      className="w-full"
                      {...form.register("name")}
                    />
                  </div>

                  <div className="grid gap-3">
                    <Label htmlFor="slug">slug</Label>
                    <Input
                      type="text"
                      name="slug"
                      className="w-full"
                      {...form.register("slug")}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <div className="grid gap-3">
                          <Label htmlFor="type">Type</Label>
                          <Select
                            name="type"
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="base_oil">Base Oil</SelectItem>
                              <SelectItem value="essential_oil">
                                Essential Oil
                              </SelectItem>
                              <SelectItem value="lye">Lye</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Update</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
