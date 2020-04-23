using System.Collections.Generic;
using UnityEngine;

/*
 * Sources/Inspiration for this project include: 
 * http://iquilezles.org/www/articles/distfunctions/distfunctions.htm
 *  For the SDF distance functions
 * Sebastian Lague's youtube channel for the inspiration and application of Ray Marching
 * https://www.youtube.com/user/Cercopithecan/featured
 * */


[ExecuteInEditMode, ImageEffectAllowedInSceneView]
public class Master : MonoBehaviour
{
    public ComputeShader raymarching;
    RenderTexture target;
    Camera cam;
    Light lightSource;
    List<ComputeBuffer> buffersToDispose;

    private void Init()
    {
        cam = Camera.current;
        lightSource = FindObjectOfType<Light>();
    }

    private void OnRenderImage(RenderTexture source, RenderTexture destination)
    {
        Init();
        buffersToDispose = new List<ComputeBuffer>();

        InitRenderTexture();
        CreateScene();
        SetParameters();

        raymarching.SetTexture(0, "Source", source);
        raymarching.SetTexture(0, "Destination", target);


        int threadGroupsX = Mathf.CeilToInt(cam.pixelWidth / 8.0f);
        int threadGroupsY = Mathf.CeilToInt(cam.pixelHeight / 8.0f);

        raymarching.Dispatch(0, threadGroupsX, threadGroupsY, 1);

        Graphics.Blit(target, destination);

        foreach (var buffer in buffersToDispose)
        {
            buffer.Dispose();
        }
    }

    void CreateScene()
    {
        List<Shape> allShapes = new List<Shape>(FindObjectsOfType<Shape>());
        allShapes.Sort((a, b) => a.operation.CompareTo(b.operation));

        List<Shape> orderedShapes = new List<Shape>();

        for (int i = 0; i < allShapes.Count; i++)
        {
            //Add all "parent"/top-level shapes.
            if (allShapes[i].transform.parent == null)
            {
                Transform parentShape = allShapes[i].transform;
                orderedShapes.Add(allShapes[i]);
                allShapes[i].numChildren = parentShape.childCount;
                //Add all (non-nested) children.
                for (int j = 0; j < parentShape.childCount; j++)
                {
                    if (parentShape.GetChild(j).GetComponent<Shape>() != null)
                    {
                        orderedShapes.Add(parentShape.GetChild(j).GetComponent<Shape>());
                        orderedShapes[orderedShapes.Count - 1].numChildren = 0;
                    }

                }
            }
        }

        ShapeData[] shapeData = new ShapeData[orderedShapes.Count];
        for (int i = 0; i < orderedShapes.Count; i++)
        {
            var shape = orderedShapes[i];
            Vector3 col = new Vector3(shape.col.r, shape.col.g, shape.col.b);
            shapeData[i] = new ShapeData()
            {
                position = shape.Position,
                scale = shape.Scale,
                color = col,
                shapeType = (int)shape.shapeType,
                operation = (int)shape.operation,
                blendStrength = shape.blendStrength * 3,
                numChildren = shape.numChildren
            };
        }

        ComputeBuffer shapeBuffer = new ComputeBuffer(shapeData.Length, ShapeData.GetSize());
        shapeBuffer.SetData(shapeData);
        raymarching.SetBuffer(0, "shapes", shapeBuffer);
        raymarching.SetInt("numShapes", shapeData.Length);

        buffersToDispose.Add(shapeBuffer);
    }


    //Sets the parameters for the compute shader.
    void SetParameters()
    {
        bool lightIsDirectional = lightSource.type == LightType.Directional;
        raymarching.SetMatrix("_CameraToWorld", cam.cameraToWorldMatrix);
        raymarching.SetMatrix("_CameraInverseProjection", cam.projectionMatrix.inverse);
        raymarching.SetVector("_Light", (lightIsDirectional) ? lightSource.transform.forward : lightSource.transform.position);
        raymarching.SetBool("positionLight", !lightIsDirectional);
    }

    void InitRenderTexture()
    {
        //Check if our current texture is null or improperly sized.
        if (target == null || target.width != cam.pixelWidth || target.height != cam.pixelHeight)
        {
            if (target != null)
            {
                target.Release();
            }
            target = new RenderTexture(cam.pixelWidth, cam.pixelHeight, 0, RenderTextureFormat.ARGBFloat, RenderTextureReadWrite.Linear);
            target.enableRandomWrite = true;
            target.Create();
        }
    }

    //Data construct to store all of the parameters of the shape object.
    struct ShapeData
    {
        public Vector3 position;
        public Vector3 scale;
        public Vector3 color;
        public int shapeType;
        public int operation;
        public float blendStrength;
        public int numChildren;

        public static int GetSize()
        {
            return sizeof(float) * 10 + sizeof(int) * 3;
        }
    }

}
