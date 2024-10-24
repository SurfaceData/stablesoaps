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

const QUERY = gql`
  query Recipes {
    recipes {
      id
      name
    }
  }
`;

const MUTATION = gql`
  mutation AddBatch($input: BatchInput!) {
    addBatch(input: $input) {
      id
    }
  }
`;

interface BatchInput {
  recipeId: number;
  amount: number;
  numBars: number;
}

export function NewBatchForm() {
  const router = useRouter();
  const form = useForm<BatchInput>({
    defaultValues: {
      amount: 600,
      numBars: 6,
    },
  });
  const { data } = useSuspenseQuery(QUERY);
  const recipes = data.recipes;
  const [add, unused1] = useMutation(MUTATION, {
    onCompleted: () => {
      router.push("/");
    },
  });
  const onSubmit = (data) => {
    add({
      variables: {
        input: data,
      },
    });
  };

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
      <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
        <Card x-chunk="dashboard-07-chunk-0">
          <CardHeader>
            <CardTitle>New Batch</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      type="text"
                      name="amount"
                      step="0.01"
                      className="w-full"
                      {...form.register("amount", {
                        valueAsNumber: true,
                      })}
                    />
                  </div>

                  <div className="grid gap-3">
                    <Label htmlFor="numBars">Num Bars</Label>
                    <Input
                      type="text"
                      name="numBars"
                      step="1"
                      className="w-full"
                      {...form.register("numBars", {
                        valueAsNumber: true,
                      })}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="recipeId"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Recipe</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-[200px] justify-between",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value
                                  ? recipes.find((i) => i.id === field.value)
                                      ?.name
                                  : "Select Recipe"}
                                <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[200px] p-0">
                            <Command>
                              <CommandInput
                                placeholder="Search Recipes..."
                                className="h-9"
                              />
                              <CommandList>
                                <CommandEmpty>No Recipefound.</CommandEmpty>
                                <CommandGroup>
                                  {recipes.map((item) => (
                                    <CommandItem
                                      key={`recipe-${item.id}`}
                                      value={item.id}
                                      onSelect={() => {
                                        form.setValue("recipeId", item.id);
                                      }}
                                    >
                                      {item.name}
                                      <CheckIcon
                                        className={cn(
                                          "ml-auto h-4 w-4",
                                          item.id === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit">Create</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
