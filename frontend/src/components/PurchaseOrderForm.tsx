"use client";

import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { gql, useQuery, useMutation } from "@apollo/client";
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
  query Ingredients {
    ingredients {
      id
      name
    }
  }
`;

const ADD_MUTATION = gql`
  mutation AddPurchaseOrder($input: PurchaseOrderInput!) {
    addPurchaseOrder(input: $input) {
      id
    }
  }
`;

interface PurchaseOrderItem {
  ingredientId: number;
  price: number;
  quantity: number;
}

interface EditPurchaseOrderInput {
  total: number;
  status: string;
  items: PurchaseOrderItem[];
}

export function PurchaseOrderForm({ order }) {
  const router = useRouter();
  const form = useForm<EditPurchaseOrderInput>({
    defaultValues: order,
  });
  const { fields, append } = useFieldArray({
    name: "items",
    control: form.control,
  });
  const { data } = useQuery(QUERY);
  const [addOrder, { loading, error }] = useMutation(ADD_MUTATION, {
    onCompleted: () => {
      router.push("/");
    },
  });

  const onSubmit = (data) => {
    if (!order) {
      addOrder({
        variables: {
          input: data,
        },
      });
      return;
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
      <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
        <Card x-chunk="dashboard-07-chunk-0">
          <CardHeader>
            <CardTitle>Edit Purchase Order</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid gap-6">
                  <FormField
                    control={form.control}
                    name="supplierName"
                    render={({ field }) => (
                      <FormItem>
                        <div className="grid gap-3">
                          <Label htmlFor="supplierName">Supplier Name</Label>
                          <Select
                            name="supplierName"
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Wholesale Supplies Plus">
                                Wholesale Supplies Plus
                              </SelectItem>
                              <SelectItem value="Berry Bramble">
                                Berry Bramble
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-3">
                    <Label htmlFor="total">Total</Label>
                    <Input
                      type="number"
                      step="0.01"
                      name="total"
                      className="w-full"
                      {...form.register("total", { valueAsNumber: true })}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <div className="grid gap-3">
                          <Label htmlFor="status">Status</Label>
                          <Select
                            name="status"
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="created">Create</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="completed">
                                Completed
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </FormItem>
                    )}
                  />

                  <div>
                    {fields.map((field, index) => (
                      <div key={field.id}>
                        <FormField
                          control={form.control}
                          name={`items.${index}.ingredientId`}
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Ingredient</FormLabel>
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
                                        ? data.ingredients.find(
                                            (i) => i.id === field.value
                                          )?.name
                                        : "Select Ingredient"}
                                      <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-[200px] p-0">
                                  <Command>
                                    <CommandInput
                                      placeholder="Search Ingredients..."
                                      className="h-9"
                                    />
                                    <CommandList>
                                      <CommandEmpty>
                                        No ingredients found.
                                      </CommandEmpty>
                                      <CommandGroup>
                                        {data.ingredients.map((item) => (
                                          <CommandItem
                                            value={item.id}
                                            key={item.id}
                                            onSelect={() => {
                                              form.setValue(
                                                `items.${index}.ingredientId`,
                                                item.id
                                              );
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
                        <FormField
                          control={form.control}
                          name={`items.${index}.price`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel
                                className={cn(index !== 0 && "sr-only")}
                              >
                                Price
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  {...form.register(`items.${index}.price`, {
                                    valueAsNumber: true,
                                  })}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`items.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel
                                className={cn(index !== 0 && "sr-only")}
                              >
                                Quantity
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  {...form.register(`items.${index}.quantity`, {
                                    valueAsNumber: true,
                                  })}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() =>
                        append({
                          ingredientId: 0,
                          price: 0.0,
                          quantity: 0,
                        })
                      }
                    >
                      Add Item
                    </Button>
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
