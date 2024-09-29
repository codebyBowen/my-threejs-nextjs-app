"use client";

import dynamic from "next/dynamic";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

const ThreeJsScene = dynamic(() => import("./components/ThreeJsScene"), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-6">
        Welcome to ThreeJs Quick Start
      </h1>

      <Tabs defaultValue="overview" className="mb-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="instructions">Instructions</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
              <CardDescription>
                A 3D model viewer built with Three.js and Next.js
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                This project demonstrates the integration of Three.js with
                Next.js, allowing for interactive 3D model viewing directly in
                the browser. It showcases the power of web-based 3D graphics and
                the flexibility of modern web development frameworks.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>Key Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                <li>Load and display GLTF 3D models</li>
                <li>Switch between multiple 3D models</li>
                <li>Adjust model rotation speed</li>
                <li>Responsive design for various screen sizes</li>
                <li>Built with modern web technologies (Next.js, Three.js)</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="instructions">
          <Card>
            <CardHeader>
              <CardTitle>How to Use</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Use the dropdown menu to select different 3D models</li>
                <li>
                  Adjust the slider to change the rotation speed of the model
                </li>
                <li>
                  The current rotation speed is displayed next to the slider
                </li>
                <li>
                  The 3D model will automatically rotate based on the selected
                  speed
                </li>
                <li>
                  You can view the model from different angles as it rotates
                </li>
              </ol>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>3D Model Viewer</CardTitle>
          <CardDescription>Interact with the 3D model below</CardDescription>
        </CardHeader>
        <CardContent>
          <ThreeJsScene />
        </CardContent>
      </Card>

      <Button asChild>
        <a
          href="https://github.com/codebyBowen/threejs-quickstart-template"
          target="_blank"
          rel="noopener noreferrer"
        >
          View on GitHub
        </a>
      </Button>
    </main>
  );
}
