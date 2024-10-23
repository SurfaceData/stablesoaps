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
  query Ingredients {
    ingredients {
      id
      name
      type
    }
  }
`;

const ADD_MUTATION = gql`
  mutation AddRecipe($input: RecipeInput!) {
    addRecipe(input: $input) {
      id
    }
  }
`;

const UPDATE_MUTATION = gql`
  mutation UpdateRecipe($id: Int!, $input: RecipeInput!) {
    updateRecipe(id: $id, input: $input) {
      id
    }
  }
`;

interface RecipeItem {
  ingredientId: number;
  quantity: number;
}

interface EditRecipeInput {
  name: string;
  originName: string;
  water: RecipeItem;
  lye: RecipeItem;
  essentialOils: RecipeItem[];
  baseOils: RecipeItem[];
}

export function RecipeForm({ recipe }) {
  const router = useRouter();
  const form = useForm<EditRecipeInput>({
    defaultValues: {
      water: {
        ingredientId: 1,
        quantity: 0.0,
      },
      lye: {
        ingredientId: 0,
        quantity: 0.0,
      },
      ...recipe,
    },
  });
  const { fields: baseFields, append: baseAppend } = useFieldArray({
    name: "baseOils",
    control: form.control,
  });
  const { fields: eoFields, append: eoAppend } = useFieldArray({
    name: "essentialOils",
    control: form.control,
  });

  const { data } = useSuspenseQuery(QUERY);
  const lyes = data.ingredients.filter(({ type }) => type === "lye");
  const baseOils = data.ingredients.filter(({ type }) => type === "base_oil");
  const essentialOils = data.ingredients.filter(
    ({ type }) => type === "essential_oil"
  );
  const [addRecipe, unused1] = useMutation(ADD_MUTATION, {
    onCompleted: () => {
      router.push("/");
    },
  });
  const [updateRecipe, unused2] = useMutation(UPDATE_MUTATION, {
    onCompleted: () => {
      router.push("/");
    },
  });

  const onSubmit = (data) => {
    if (!recipe) {
      addRecipe({
        variables: {
          input: data,
        },
      });
      return;
    }
    updateRecipe({
      variables: {
        id: recipe.id,
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
              {recipe ? "Edit " : "New "}
              Recipe
            </CardTitle>
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
                    <Label htmlFor="originName">Origin Name</Label>
                    <Input
                      type="text"
                      name="originName"
                      className="w-full"
                      {...form.register("originName")}
                    />
                  </div>

                  <div className="grid gap-3">
                    <Label htmlFor="water.quantity">Water Percentage</Label>
                    <Input
                      type="number"
                      step="0.01"
                      name="water.quantity"
                      className="w-full"
                      {...form.register("water.quantity", {
                        valueAsNumber: true,
                      })}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="lye.ingredientId"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Lye</FormLabel>
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
                                  ? lyes.find((i) => i.id === field.value)?.name
                                  : "Select Lye"}
                                <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[200px] p-0">
                            <Command>
                              <CommandInput
                                placeholder="Search Lyes..."
                                className="h-9"
                              />
                              <CommandList>
                                <CommandEmpty>No Lye found.</CommandEmpty>
                                <CommandGroup>
                                  {lyes.map((item) => (
                                    <CommandItem
                                      key={`lye-${item.id}`}
                                      value={item.id}
                                      onSelect={() => {
                                        form.setValue(
                                          "lye.ingredientId",
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

                  <div className="grid gap-3">
                    <Label htmlFor="lye.quantity">Lye Percentage</Label>
                    <Input
                      type="number"
                      step="0.01"
                      name="lye.quantity"
                      className="w-full"
                      {...form.register("lye.quantity", {
                        valueAsNumber: true,
                      })}
                    />
                  </div>

                  <div>
                    {baseFields.map((field, index) => (
                      <div key={field.id}>
                        <FormField
                          control={form.control}
                          name={`baseOils.${index}.ingredientId`}
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Base Oil</FormLabel>
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
                                        ? baseOils.find(
                                            (i) => i.id === field.value
                                          )?.name
                                        : "Select Base Oil"}
                                      <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-[200px] p-0">
                                  <Command>
                                    <CommandInput
                                      placeholder="Search Base Oils..."
                                      className="h-9"
                                    />
                                    <CommandList>
                                      <CommandEmpty>
                                        No Base Oil found.
                                      </CommandEmpty>
                                      <CommandGroup>
                                        {baseOils.map((item) => (
                                          <CommandItem
                                            value={item.id}
                                            key={item.id}
                                            onSelect={() => {
                                              form.setValue(
                                                `baseOils.${index}.ingredientId`,
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
                          name={`baseOils.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel
                                className={cn(index !== 0 && "sr-only")}
                              >
                                Percentage
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  {...form.register(
                                    `baseOils.${index}.quantity`,
                                    {
                                      valueAsNumber: true,
                                    }
                                  )}
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
                        baseAppend({
                          ingredientId: 0,
                          quantity: 0.0,
                        })
                      }
                    >
                      Add Base Oil
                    </Button>
                  </div>

                  <div>
                    {eoFields.map((field, index) => (
                      <div key={field.id}>
                        <FormField
                          control={form.control}
                          name={`essentialOils.${index}.ingredientId`}
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Essential Oil</FormLabel>
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
                                        ? essentialOils.find(
                                            (i) => i.id === field.value
                                          )?.name
                                        : "Select Base Oil"}
                                      <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-[200px] p-0">
                                  <Command>
                                    <CommandInput
                                      placeholder="Search Essential Oils..."
                                      className="h-9"
                                    />
                                    <CommandList>
                                      <CommandEmpty>
                                        No Essential Oil found.
                                      </CommandEmpty>
                                      <CommandGroup>
                                        {essentialOils.map((item) => (
                                          <CommandItem
                                            value={item.id}
                                            key={item.id}
                                            onSelect={() => {
                                              form.setValue(
                                                `essentialOils.${index}.ingredientId`,
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
                          name={`essentialOils.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel
                                className={cn(index !== 0 && "sr-only")}
                              >
                                Percentage
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  {...form.register(
                                    `essentialOils.${index}.quantity`,
                                    {
                                      valueAsNumber: true,
                                    }
                                  )}
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
                        eoAppend({
                          ingredientId: 0,
                          quantity: 0.0,
                        })
                      }
                    >
                      Add Essential Oil
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
