import PermissionFormComp from "@/components/Dashboard/AccessControlPage/PermissionFormComp";


const NewPermissionPage = () => {
  return (
    <div className=" mx-auto">
      <PermissionFormComp mode="create" />
    </div>
  );
};

export default NewPermissionPage;