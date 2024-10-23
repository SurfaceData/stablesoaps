"use client";

import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { gql, useSuspenseQuery, useQuery, useMutation } from "@apollo/client";
import { cn } from "@/lib/utils";
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const UPDATE_MUTATION = gql`
  mutation UpdateInventoryItem($id: Int!, $input: InventoryItemInput!) {
    updateInventoryItem(id: $id, input: $input) {
      id
    }
  }
`;

interface EditInventoryItemInput {
  quantity: number;
}

export function InventoryItemForm({ item }) {
  const router = useRouter();
  const form = useForm<EditInventoryItemInput>({
    defaultValues: item,
  });
  const [update, unused2] = useMutation(UPDATE_MUTATION, {
    onCompleted: () => {
      router.push("/");
    },
  });

  const onSubmit = (data) => {
    update({
      variables: {
        id: item.id,
        input: data,
      },
    });
  };

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
      <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
        <Card x-chunk="dashboard-07-chunk-0">
          <CardHeader>
            <CardTitle>
              {item ? `Edit ${item.ingredient.name}` : "New Inventory Item"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      type="number"
                      name="quantity"
                      step="0.01"
                      className="w-full"
                      {...form.register("quantity", {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
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
